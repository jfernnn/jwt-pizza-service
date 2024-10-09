const request = require('supertest');
const app = require('../service');

//const { Role, DB } = require('../database/database.js');
const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let userIdNum;
let adminUser = { email: 'a@jwt.com', password: 'admin'}
/*
async function createAdminUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';
  
    await DB.addUser(user);
  
    return user;
}
  */
function randomName() {
      return Math.random().toString(36).substring(2, 12);
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  //console.log(registerRes)
  userIdNum = registerRes.body.user.id;
  testUserAuthToken = registerRes.body.token;

  //console.log(testUserAuthToken)
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
  console.log(password)
  
});

test('Register user fail', async () => {
    const failUser = { email: 'reg@test.com', password: 'a' };
    const loginRes = await request(app).post('/api/auth').send(failUser);

    expect(loginRes.status).toBe(400);
    
});

test('test docs endpoint', async () => {
    const homePage = await request(app).get('/api/').send(testUser);
    expect(homePage.status).toBe(404);
    expect(homePage.body.message).toMatch('unknown endpoint')
});

test('test docs endpoint', async () => {
    const homePage = await request(app).get('/').send(testUser);
    expect(homePage.status).toBe(200);
    expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test docs endpoint', async () => {
    const homePage = await request(app).get('/api/docs').send(testUser);
    expect(homePage.status).toBe(200);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test update user fail', async () => {
    testUser.name = "Joshua"
    const homePage = await request(app).put(`/api/auth/${userIdNum}`).send(testUser);
    expect(homePage.status).toBe(401);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test update user succeed', async () => {
    testUser.name = "Joshua"
    const homePage = await request(app).put(`/api/auth/${userIdNum}`).set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(homePage.status).toBe(200);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test orderRouter get', async () => {
    const homePage = await request(app).get('/api/order/menu').send(testUser);
    expect(homePage.status).toBe(200);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test orderRouter put', async () => {
    const homePage = await request(app).put('/api/order/menu').send(testUser);
    expect(homePage.status).toBe(401);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test orderRouter order pizza', async () => {
   // const loginRes = await request(app).put('/api/auth').send(testUser);

    const orderRequest = {
        franchiseId: 1,
        storeId: 1,
        items: [
          { menuId: 1, description: 'Veggie', price: 0.05 },
        ],
    };
    const homePage = await request(app).post('/api/order').set("Authorization", `Bearer ${testUserAuthToken}`).send(orderRequest);
    expect(homePage.status).toBe(200);
    const getOrders = await request(app).get('/api/order').set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(getOrders.status).toBe(200);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test orderRouter order pizza', async () => {
    // const loginRes = await request(app).put('/api/auth').send(testUser);
 
     const orderRequest = {
         franchiseId: 19,
         storeId: 81,
         items: [
           { menuId: 41, description: 'Vaggie', price: 10.05 },
         ],
     };
     const homePage = await request(app).post('/api/order').set("Authorization", `Bearer ${testUserAuthToken}`).send(orderRequest);
     expect(homePage.status).toBe(500);
     //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
 });

test('test add a pizza fail', async () => {
    // const loginRes = await request(app).put('/api/auth').send(testUser);
 
     const newMenuItem = { 
        "title":"Josh", 
        "description": "Nothing but cheese.. and I mean nothing",
        "image":"pizza9.png", 
        "price": 0.00014
    };
    const homePage = await request(app).put('/api/order/menu').set("Authorization", `Bearer ${testUserAuthToken}`).send(newMenuItem);
    expect(homePage.status).toBe(403);
     //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});


test('test list the franchises', async () => {
//    const authUser = createAdminUser()
 
    const homePage = await request(app).get('/api/franchise').set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(homePage.status).toBe(200);
     //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});


test('test add a new pizza to menu', async () => {
    //const logOut = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testUserAuthToken}`);
    //expect(logOut.status).toBe(200)
    // const loginRes = await request(app).put('/api/auth').send(testUser);
   // const authUser = await createAdminUser()

    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    console.log(registerResAdmin.body)
    
    const testAdminAuthToken = registerResAdmin.body.token;

     const newMenuItem = { 
        "id": 14,
        "title":"Josh", 
        "description": "Nothing but cheese.. and I mean nothing",
        "image":"pizza9.png", 
        "price": 0.00014
    };
    const homePage = await request(app).put('/api/order/menu').set("Authorization", `Bearer ${testAdminAuthToken}`).send(newMenuItem);
    expect(homePage.status).toBe(200);
     //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});


test('logout', async () => {
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200);
});

test('test get user franchises', async () => {
    const homePage = await request(app).get(`/api/franchise/${userIdNum}`).set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(homePage.status).toBe(200);
   // expect(homePage.body.message).toMatch('unknown endpoint')
});


/*
test('test delete franchises', async () => {

   // const authUser = await createAdminUser();
    const u = {email: "jy5z2gjfxe@admin.com", password: "$2b$10$GhnsIDBn2l/FH.RruHLUY.QaqrmUChETgudjG80GBXHOSSMXeDLIK"}

    const registerResAdmin = await request(app).put('/api/auth').send(u);
    expect(registerResAdmin.status).toBe(200);
    
    const testAdminAuthToken = registerResAdmin.body.token;
   // console.log(registerResAdmin)

    const homePage = await request(app).delete(`/api/franchise/1`).set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(homePage.status).toBe(403);
   // expect(homePage.body.message).toMatch('unknown endpoint')
});*/
