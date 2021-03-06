import { all } from 'redux-saga/effects';
import loginSaga from './login.saga';
import registrationSaga from './registration.saga';
import userSaga from './user.saga';
import csvSaga from './csv.saga';
import adminSaga from './admin.saga';
import coachSaga from './coach.saga';
import payoutSaga from './payout.saga'
import userForm from './userForm.saga'


// rootSaga is the primary saga.
// It bundles up all of the other sagas so our project can use them.
// This is imported in index.js as rootSaga

// some sagas trigger other sagas, as an example
// the registration triggers a login
// and login triggers setting the user
export default function* rootSaga() {
  yield all([
    loginSaga(), // login saga is now registered
    registrationSaga(),
    userSaga(),
    csvSaga(), //saga to handle new csv information
    userForm(), //saga to handle new user form data
    adminSaga(), // saga to populate admin related reducers
    coachSaga(), // saga to handle all coach related requests
    payoutSaga(), //saga to return information on invoices paid and not paid


  ]);
}
