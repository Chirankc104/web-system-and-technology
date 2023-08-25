

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const Photo = require('./models/photo'); // Import your models
const sequelize = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'your-secret-key', // Change this to a strong, random string
  resave: false,
  saveUninitialized: true
}));

// File storage setup using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// CRUD operations
app.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).send('Error fetching photos');
  }
});

app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const image = await Photo.findByPk(id);
    res.render('edit', { image });
  } catch (error) {
    console.error('Error fetching photo for edit:', error);
    res.status(500).send('Error fetching photo for edit');
  }
});

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  try {
    const image = await Photo.findByPk(id);
    if (image) {
      image.name = name;
      await image.save();
      res.redirect('/home'); // Redirect to home after edit
    } else {
      res.status(404).send('Photo not found');
    }
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).send('Error updating photo');
  }
});


app.get('/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const image = await Photo.findByPk(id);
    if (image) {
      await image.destroy();
      res.redirect('/home'); // Redirect to home after delete
    } else {
      res.status(404).send('Photo not found');
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).send('Error deleting photo');
  }
});


app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', upload.single('image'), async (req, res) => {
  const { name } = req.body;
  const imageFilename = req.file ? req.file.filename : null;
  try {
    await Photo.create({
      name: name,
      image: imageFilename
    });
    res.redirect('/home'); // Redirect to home after adding
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).send('Error adding photo');
  }
});


app.get('/signup', (req, res) => {
  res.render('signup');
});
app.get('/login', (req, res) => {
  res.render('form');
});

app.get('/hello', (req, res) => {
  res.render('form');
});

app.get('/form', (req, res) => {
  res.redirect('home');
});


app.get('/home', async (req, res) => {
  try {
    const photos = await Photo.findAll();
    res.render('home', { photos: photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).send('Error fetching photos');
  }
});


// Sync models with the database
sequelize.sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
