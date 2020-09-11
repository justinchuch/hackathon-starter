const got = require('got')
const { v4: uuidv4, v1: uuidv1 } = require( "uuid" )


/* --------------------  MODULE VARIABLES  -------------------- */
let authentication_attempts = 0
let auth_token = ""
let restURL = ""
let username = ""
let password = ""
let connection = {}
let models = {}


/* --------------------  UTILITY FUNCTIONS  ---------------------- */ 
// verify connectivity synchronously by grabbing the session token
async function connect(uri, user, pass){
  restURL = uri
  username = user
  password = pass
  return await authenticate()
}

// establish the authToken we'll use for communication with the Astra REST interface
async function authenticate(){
  // return the cached token
  if( auth_token ){
    return auth_token
  }
  try {
    // note, hardcoded to API version 1
    var auth = await post(false)( `${restURL}/v1/auth`, {username:username, password:password})
    if( auth && auth["authToken"] ){
      authentication_attempts = 0 // a good authToken indicates success
      auth_token = auth["authToken"]
    }
    return auth_token
  } catch( e ){
    // TODO: switch on each bad status code; probably factor out that part
    auth_token = ""
    if( e.response ) handleHTTPError( e.response, authenticate )
    console.log( e.responseBody )
  }
}


// Avoid a loop when called from database.authenticate() by passing false
function post( getToken = true, method = "POST" ){
  return async function post_vals( url, post_object ){
    let headers =         {"x-cassandra-request-id": uuidv4()}
    if( getToken ) headers["x-cassandra-token"] = await authenticate()
    try {
      const response = await got(url,
        { method,
          headers,
          json: post_object,
          responseType: 'json'})
      if( response && response.body ){
        body = response.body
        if( body && body.errors && body.errors.length ) throw new Error( body.errors[0].message )
        return body
      } else if( response.statusCode >= 200 && response.statusCode <= 304 ) {
        return { statusCode:response.statusCode }
      } else {
        return response
      }
      // GQL API may return an HTTP success but embed errors into the response
      // throw an exception with the message
    } catch(e) {
      console.log( e );
      if( e && e.response ) handleHTTPError( e.response, ()=> post.apply( arguments ))
    }
  }
}

function get(){
  return async function get_vals( url ){
    try {
      const {body} = await got(url,
        { method: 'GET',
          headers: {"x-cassandra-request-id": uuidv4(), "x-cassandra-token": await authenticate()},
          responseType: 'json'})
      return body
    } catch(e) {
      // need to do more than this; probably re-throw
      handleHTTPError( e.response, get )
      // console.log( e );
    }
  }
}


// handle the various kinds of HTTP Errors
function handleHTTPError( response, retry_function ){
  function log(code, message){ console.log(`--------------------- Encountered HTTP Code ${code}: ${message} ---------------------`); }
  switch ( response.statusCode ) {
    case 304: // Not Modified
        log(304, "Not Modified")
      break;
    case 400: // Bad Request
      log( 400, "Bad Request")
      break;
    case 401: // Unauthorized
        if( authentication_attempts++ < 2 ){ // retry
          retry_function()
        }
        log( 401, `Unauthorized (${authentication_attempts} failed login attempts)`)
      break;
    case 403: // Forbidden
      log( 403, "Forbidden")
      break;
    case 404: // Not Found
      log( 404, "Not Found")
      break;
    case 500: // Internal Server Error
      log( 500, "Internal Server Error")
      break;
    case 501: // Not Implemented
      log( 501, "Not Implemented")
      break;
    case 502: // Bad Gateway
      log( 502, "Bad Gateway")
      break;
    case 503: // Service Unavailable
      log( 503, "Service Unavailable")
      break;
    case 504: // Gateway Timeout
      log( 504, "Gateway Timeout")
      break;
    default:
      log( response.statusCode, "CURRENTLY UNHANDLED CODE - SHOULD IMPLEMENT")
      break;
  }
}

function token(){
  return auth_token
}


// simplified EventEmitter wiring; TODO: replace with real EventEmitter
let event_listeners = {}

// register for an arbitrarily named event
function register_for_event( event_name, callback ){
  if( !event_listeners[event_name] ){
    event_listeners[event_name] = []
  }
  event_listeners[event_name].push( callback )
  return callback
}

// notify callers who have registered for a named event
function notify_listeners_for_event( event_name, data ){
  if( event_listeners[event_name] && event_listeners[event_name].length() > 0 ){
    try {
       event_listeners[event_name].forEach( cb => cb.call({}, data))
    } catch( ex ){
      // mostly silently ignore exceptions thrown from listeners
      console.log( ex )
    }
  }
  return true
}

connection.on = register_for_event

// register a model
function model(model_name, schema_instance){
  // TODO: this is probably where we should initialize the schema
  models['model_name'] = schema_instance
}

class Schema {
  constructor( schema_definition, schema_options ){
    this.schema_definition = schema_definition
    this.schema_options = schema_options
    this.methods = {}
  }

  pre( event_name, callback ){
    // expects a "next" callback to be passed in
    callback.call( this, () => {})
    return true
  }
}


const astra = { get, post, authenticate, token, connection, Schema }
module.exports = astra
