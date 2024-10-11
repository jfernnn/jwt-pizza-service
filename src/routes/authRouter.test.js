const request = require('supertest');
const app = require('../service');

const { Role, DB } = require('../database/database.js');
const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let userIdNum;
let adminUser = { email: 'a@jwt.com', password: 'admin'}
let franchiseID;
let storeID;

async function createAdminUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';
  
    await DB.addUser(user);
  
    return user;
}
  
function randomName() {
      return Math.random().toString(36).substring(2, 12);
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  //console.log(registerRes)
  userIdNum = registerRes.body.user.id;
  testUserAuthToken = registerRes.body.token;
  const ad = await createAdminUser()
  adminUser.password = ad.password
  adminUser.email = ad.email
/*
  const addItem1 = { id:1, title:"Veggie", description: "A garden of delight", image:"pizza1.png", price: 0.0038 }
  const addItem2 = { id:2, title:"Pepperoni", description: "Spicy treat", image:"pizza2.png", price: 0.0042 }
  await DB.addMenuItem(addItem1)
  await DB.addMenuItem(addItem2)

  const addFranchisee = {name:"pizza franchisee", email:"f@jwt.com", password:"franchisee", roles: [{ role: Role.Franchisee }]}
  await DB.addUser(addFranchisee)

  const addFranchise = { name: "pizzaPocket", "admins": [{email: "f@jwt.com"}]}
  await DB.createFranchise(addFranchise)

  const addStore = {franchiseId: 1, name:"SLC"}
  await DB.createStore(addStore)


*/
  //console.log(testUserAuthToken)
});

test('login success', async () => {
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


test('test main page fail', async () => {
    const homePage = await request(app).get('/api/').send(testUser);
    expect(homePage.status).toBe(404);
    expect(homePage.body.message).toMatch('unknown endpoint')
});

test('test main page success', async () => {
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
    const homePage = await request(app).put(`/api/auth/32`).set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(homePage.status).toBe(403);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test update user success', async () => {
    testUser.name = "Joshua"
    const homePage = await request(app).put(`/api/auth/${userIdNum}`).set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(homePage.status).toBe(200);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test get pizza success', async () => {
    const homePage = await request(app).get('/api/order/menu').send(testUser);
    expect(homePage.status).toBe(200);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('test add item to menu fail', async () => {
    const homePage = await request(app).put('/api/order/menu').send(testUser);
    expect(homePage.status).toBe(401);
    //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});


test('test order pizza w invalid order', async () => {
    // const loginRes = await request(app).put('/api/auth').send(testUser);
 
     const orderRequest = {
         franchiseId: 199,
         storeId: 891,
         items: [
           { menuId: 491, description: 'Vaggie', price: 10.05 },
         ],
     };
     const homePage = await request(app).post('/api/order').set("Authorization", `Bearer ${testUserAuthToken}`).send(orderRequest);
     expect(homePage.status).toBe(500);
    // expect(homePage.status.message).toMatch('Failed to fulfill order at factory')
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

test('test list the franchises as admin', async () => {
    //    const authUser = createAdminUser()
    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    const testAdminAuthToken = registerResAdmin.body.token;

    const homePage = await request(app).get('/api/franchise').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(homePage.status).toBe(200);
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
});

test('test add a new pizza to menu success', async () => {
    //const logOut = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testUserAuthToken}`);
    //expect(logOut.status).toBe(200)
    // const loginRes = await request(app).put('/api/auth').send(testUser);
   // const authUser = await createAdminUser()

    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    
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
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
     //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
});

test('create franchise user', async () => {
    let franchiseUser = { password: 'franch', roles: [{ role: Role.Franchisee }] };
    franchiseUser.name = "franchisee" + randomName();
    franchiseUser.email = franchiseUser.name + '@franchise.com';

    const registerFranchiseRes = await request(app).post('/api/auth').send(franchiseUser);
    expect(registerFranchiseRes.status).toBe(200)


})

test('test get user franchises', async () => {
 //   testUser.password = 'a'
 //   const loginRes = await request(app).put('/api/auth').send(testUser);
 //   expect(loginRes.status).toBe(200)
    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    const testAdminAuthToken = registerResAdmin.body.token;

    const homePage = await request(app).get(`/api/franchise/1`).set("Authorization", `Bearer ${testAdminAuthToken}`).send();
    expect(homePage.status).toBe(200);

    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
   // expect(homePage.body.message).toMatch('unknown endpoint')
});

test('test get user franchises', async () => {
    //   testUser.password = 'a'
    //   const loginRes = await request(app).put('/api/auth').send(testUser);
    //   expect(loginRes.status).toBe(200)
   
       const homePage = await request(app).get(`/api/franchise/${userIdNum}`).set("Authorization", `Bearer ${testUserAuthToken}`).send();
       expect(homePage.status).toBe(200);
   
      // expect(homePage.body.message).toMatch('unknown endpoint')
   });

test('test create franchise fail', async () => {
    const testFranchise = {name: "tester", admins: [{"email": "a@jwt.com"}]}
    const franchiseRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${testUserAuthToken}`).send(testFranchise);
    expect(franchiseRes.status).toBe(403)
});

test('test create franchise success', async () => {
    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    
    const testAdminAuthToken = registerResAdmin.body.token;
    const testFranchise = { id:4, name: "tester", admins: [{"email": adminUser.email}] }
    testFranchise.name = randomName()
    const franchiseRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testFranchise);
    expect(franchiseRes.status).toBe(200)
    franchiseID = franchiseRes.body.id

    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
});

test('test create store fail', async () => {
    const testStore= {franchiseId: 1, name:"SLC"}
    testStore.name = randomName()
    const storeRes = await request(app).post(`/api/franchise/1/store`).set("Authorization", `Bearer ${testUserAuthToken}`).send(testStore);
    expect(storeRes.status).toBe(403)

});

test('test create store success', async () => {
    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    const testAdminAuthToken = registerResAdmin.body.token;

    const testStore= {franchiseId: franchiseID, name:"SLC"}
    testStore.name = randomName()
    const storeRes = await request(app).post(`/api/franchise/${franchiseID}/store`).set("Authorization", `Bearer ${testAdminAuthToken}`).send(testStore);
    expect(storeRes.status).toBe(200)
    storeID = storeRes.body.id
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
});

test('test place and get order success', async () => {
    // const loginRes = await request(app).put('/api/auth').send(testUser);
 
     const orderRequest = {
         franchiseId: franchiseID,
         storeId: storeID,
         items: [
           { menuId: 14, description: 'Josh', price: 0.00014 },
         ],
     };
     const homePage = await request(app).post('/api/order').set("Authorization", `Bearer ${testUserAuthToken}`).send(orderRequest);
     expect(homePage.status).toBe(200);
     const getOrders = await request(app).get('/api/order').set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
     expect(getOrders.status).toBe(200);
     //expect(homePage.body.message).toMatch('welcome to JWT Pizza')
 });

 test('test delete store fail', async () => {
    const storeRes = await request(app).delete(`/api/franchise/999/store/${storeID}`).set("Authorization", `Bearer ${testUserAuthToken}`).send();
    expect(storeRes.status).toBe(403)

});

test('test delete store success', async () => {
    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    const testAdminAuthToken = registerResAdmin.body.token;

    const storeRes = await request(app).delete(`/api/franchise/${franchiseID}/store/${storeID}`).set("Authorization", `Bearer ${testAdminAuthToken}`).send();
    expect(storeRes.status).toBe(200)
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
});


test('test delete franchise fail', async () => {
    const franchiseRes = await request(app).delete(`/api/franchise/${franchiseID}`).set("Authorization", `Bearer ${testUserAuthToken}`).send();
    expect(franchiseRes.status).toBe(403)
});

test('test delete franchise fail', async () => {
    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    
    const testAdminAuthToken = registerResAdmin.body.token;
    const franchiseRes = await request(app).delete(`/api/franchise/999`).set("Authorization", `Bearer ${testUserAuthToken}`).send();
    expect(franchiseRes.status).toBe(403)
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
});

test('test delete franchise success', async () => {
    const registerResAdmin = await request(app).put('/api/auth').send(adminUser);
    expect(registerResAdmin.status).toBe(200);
    
    const testAdminAuthToken = registerResAdmin.body.token;

    const franchiseRes = await request(app).delete(`/api/franchise/${franchiseID}`).set("Authorization", `Bearer ${testAdminAuthToken}`).send();
    expect(franchiseRes.status).toBe(200)
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testAdminAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200)
});


test('logout', async () => {
    const logoutRes = await request(app).delete('/api/auth').set("Authorization", `Bearer ${testUserAuthToken}`).send(testUser);
    expect(logoutRes.status).toBe(200);
    
    testUser.password = "WRONG"
    const loginFail = await request(app).put('/api/auth').send(testUser);
    expect(loginFail.status).toBe(404)

});
