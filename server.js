const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const crypto = require("crypto");

app.use(express.json());

let courses = [];

let users = [];

let admin = [];

//Extra function

function findIndex(courseId) {
  let index = -1;
  for (i = 0; i < courses.length; i++) {
    if (courses[i].id == courseId) {
      index = i;
      break;
    }
  }
  return index;
}

function coursePurchase(courseid, index) {
  if (users[index] && users[index].purchased) {
    users[index].purchased.push(courseid);
    console.log(users[index].purchased);
    return 1;
  } else {
    console.log('User not found or missing "purchased" array');
    return 0;
  }
}

//Middlewares

//User authentication function

function Authenticate(req, res, next) {
  const { username, password } = req.headers;
  let userFound = false;
  let index = null;
  for (i = 0; i < users.length; i++) {
    if (users[i].username == username) {
      if (users[i].password == password) {
        userFound = true;
        index = i;
        break;
      } else {
        res.send("Wrong Password");
        return;
      }
    }
  }
  if (userFound) {
    console.log(index);
    req.body.userid = index;
    next();
  } else {
    res.send("Bad details");
  }
}

//Admin Authentication function

function adminAuth(req, res, next) {
  const { username, password } = req.headers;
  let userFound = false;
  let index = null;
  for (i = 0; i < admin.length; i++) {
    if (admin[i].username == username) {
      if (admin[i].password == password) {
        userFound = true;
        index = i;
        break;
      } else {
        res.send("Wrong Password");
        return;
      }
    }
  }
  if (userFound) {
    console.log(index);
    req.body.userid = index;
    next();
  } else {
    res.send("Bad details");
  }
}

// User routes

//Route to Signup for user

app.post("/users/signup", (req, res) => {
  const { username, password } = req.body;
  const id = Math.floor(1000 + Math.random() * 9000);
  const user = {
    id: id,
    username: username,
    password: password,
  };
  users.push(user);
  console.log(users);
  res.send({ Message: "user created successfully" });
});

//Route to Login for user

app.post("/users/login", Authenticate, (req, res) => {
  res.status(200).json({ message: "Login successful" });
});

// Route to List all the courses

app.get("/users/courses", Authenticate, (req, res) => {
  res.status(200).json({ courses: courses });
});

//Route to Purchase a course

app.post("/users/courses", Authenticate, (req, res) => {
  const { courseid } = req.query;
  const index = req.body.userid;
  const a = coursePurchase(courseid, index);
  if (a) {
    res.status(200).send("Course Purchased successfully");
  } else {
    res.status(404).send("Failed");
  }
});

//Route to show the purchased course to the user

app.get("/users/purchasedCourses", Authenticate, (req, res) => {
  const i = req.body.userid;
  res.send(users[i].purchased);
});

//Admin routes

//Sign up route for admin

app.post("/admin/signup", (req, res) => {
  const { username, password } = req.body;
  const id = Math.floor(1000 + Math.random() * 9000);
  const tempAdmin = {
    id: id,
    username: username,
    password: password,
  };
  admin.push(tempAdmin);
  res.status(200).json({ message: "Admin created successfully" });
});

//Login Route for admin

app.post("/admin/login", adminAuth, (req, res) => {
  res.status(200).json({ message: " logged in successfully" });
});

//Route to add a new course

app.post("/admin/courses", adminAuth, (req, res) => {
  const { title, description, price, imagelink, published } = req.body;
  const id = Math.floor(1000 + Math.random() * 9000);
  const newCourse = {
    id: id,
    title: title,
    description: description,
    price: price,
    imagelink: imagelink,
    published: published,
  };
  courses.push(newCourse);
  res.status(200).json({ message: "Course created successfully", id: id });
});

//Route to update a particular course

app.put("/admin/courses/:courseid", adminAuth, (req, res) => {
  const courseid = req.params.courseid;
  const { title, description, price, imagelink, published } = req.body;

  const index = findIndex(courseid);
  if ((index = -1)) {
    res.send("Course not found");
  }
  const updatedCourse = {
    ...courses[index],
    title,
    description,
    price,
    imagelink,
    published,
  };
  courses[index] = updatedCourse;
  res.status(200).json({
    message: "Updated the course successfully",
    updatesDetails: updatedCourse,
  });
});

//Gets all the courses for admin
app.get("/admin/courses", adminAuth, (req, res) => {
  res.status(200).send(courses);
});

app.post("/user/auth", (req, res) => {
  // Get User Credentails
  const { Name, Email, Phone } = req.body;
  const hash = crypto.createHash("sha256");
  hash.update(Name);
  // SHA256Hash Hash code UserJWT
  res.send(hash.digest("hex"), "user_auth_sucess");
  // saving the user
  users.push({
    Name,
    Email,
    Phone,
  });
});

app.post("/admin/auth", (req, res) => {
  // Get admin Credentails
  const { Name, Email, Phone, Feild } = req.body;
  const hash = crypto.createHash("sha256");
  hash.update(Name);
  // SHA256Hash Hash code AdminJWT
  res.send(hash.digest("hex"), "admin_auth_sucess");
  // saving the admin
  admin.push({
    Name,
    Email,
    Phone,
    Feild,
  });
});

app.get("/users", (req, res) => {
  if (req) return;
  res.json(users);
});

app.get("/admins", (req, res) => {
  if (req) return;
  res.json(admin);
});

//404 For any other routes
app.use((req, res, next) => {
  res.status(404).send();
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
