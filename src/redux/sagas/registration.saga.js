import { put, takeEvery, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

// worker Saga: will be fired on "REGISTER" actions
function* registerUser(action) {
  try {
    // clear any existing error on the registration page
    yield put({ type: 'CLEAR_REGISTRATION_ERROR' });
    // console.log(action.payload)
    // passes the username and password from the payload to the server
    yield axios.post('/api/user/register', action.payload);
    
    // automatically log a user in after registration
    const loginObject = {
      username: action.payload.username,
      password: action.payload.password
    }
    yield put({ type: 'LOGIN', payload: loginObject});

    // set to 'login' mode so they see the login screen
    // after registration or after they log out
    yield put({ type: 'SET_TO_LOGIN_MODE' });
  } catch (error) {
    console.log('Error with user registration:', error);
    yield put({ type: 'REGISTRATION_FAILED' });
  }
}

function* registrationSaga() {
  yield takeLatest('REGISTER', registerUser);
  // yield takeEvery('REQUEST_CODE', requestCode)
}

export default registrationSaga;
