'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('/create-user', 'AccountController.index');

Route.post('/fund/:userId', 'AccountController.fund');

Route.post('/transfer/:userId', 'AccountController.transfer');

Route.post('/add-beneficiary/:userId', 'AccountController.beneficiary');

Route.post('/withdrawal/:userId', 'AccountController.withdrawal');

Route.post('/', 'AccountController.notification');
