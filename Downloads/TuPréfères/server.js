// server.js
// Minimal Express server to collect votes and serve stats
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();
const DATA_FILE = path.join(__dirname, 'votes-data.json');

// Votre Clé Secrète reCAPTCHA
const GOOGLE_RECAPTCHA_SECRET = '6LdMUdUrAAAAAOy3kuWyrCPPEe8z0qzqN0ejVZbA';

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// VERY IMPORTANT: in prod, replace '*' with your site domain for security
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://tuprefere.onrender.com'); // restrict in prod!
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const txt = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(txt || '{}');
  } catch (e) {
    console.error('Erreur loadData', e);
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Erreur saveData', e);
  }
}

// POST /vote { id, choice } -> increments counter
app.post('/vote', (req, res) => {
  const { id, choice } = req.body;
  if (!id || !choice) return res.status(400).json({ error: 'missing id or choice' });
  const data = loadData();
  if (!data[id]) data[id] = { a: 0, b: 0 };
  if (choice === 'a') data[id].a = (data[id].a || 0) + 1;
  else if (choice === 'b') data[id].b = (data[id].b || 0) + 1;
  else return res.status(400).json({ error: 'choice must be "a" or "b"' });
  saveData(data);
  res.json({ ok: true, totals: data[id] });
});

// POST /add -> body: { a, b, category, author, g-recaptcha-response }
app.post('/add', async (req, res) => {
  const dilemma = req.body;

  // --- 1. VÉRIFICATION RECAPTCHA ---
  const recaptchaToken = dilemma['g-recaptcha-response'];
  if (!recaptchaToken) {
    return res.status(400).json({ error: 'reCAPTCHA token manquant' });
  }

  try {
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCHA_SECRET}&response=${recaptchaToken}`;
    
    // Fait la requête à l'API Google
    const { data } = await axios.post(verificationUrl); 

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return res.status(401).json({ error: 'Échec de la vérification reCAPTCHA' });
    }
  } catch (error) {
    console.error('Erreur serveur reCAPTCHA:', error.message);
    return res.status(500).json({ error: 'Erreur lors de la vérification reCAPTCHA' });
  }
  // --- FIN VÉRIFICATION RECAPTCHA ---
  
  // --- 2. LOGIQUE DE VALIDATION ET SAUVEGARDE ---

  const a = dilemma.a;
  const b = dilemma.b;
  const category = dilemma.category;
  
  // Simple validation des champs obligatoires
  if (!a || !b || !category) {
      return res.status(400).json({ error: 'Champs a, b ou catégorie manquants' });
  }
  
  // Sauvegarde dans un fichier 'community-dilemmas.json'
  const newDilemma = { 
    id: `c_${Date.now()}`, 
    a: a.trim(), 
    b: b.trim(), 
    category: category, 
    author: dilemma.author ? dilemma.author.trim() : null 
  };
  
  const cDilemmaFile = path.join(__dirname, 'community-dilemmas.json');
  let cDilemmas = [];
  if (fs.existsSync(cDilemmaFile)) {
    try {
        cDilemmas = JSON.parse(fs.readFileSync(cDilemmaFile, 'utf8'));
    } catch (e) {
        console.error('Erreur de parsing de community-dilemmas.json', e);
    }
  }
  
  cDilemmas.push(newDilemma);
  fs.writeFileSync(cDilemmaFile, JSON.stringify(cDilemmas, null, 2));

  res.json({ ok: true, message: 'Dilemme soumis pour modération.' });
});

// GET /stats?id=dilemma_01
app.get('/stats', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'missing id' });
  const data = loadData();
  res.json(data[id] || { a: 0, b: 0 });
});

// GET /community-dilemmas -> renvoie les dilemmes validés
app.get('/community-dilemmas', (req, res) => {
  const cDilemmaFile = path.join(__dirname, 'community-dilemmas.json');
  if (fs.existsSync(cDilemmaFile)) {
    res.sendFile(cDilemmaFile);
  } else {
    res.json([]); // Renvoie un tableau vide si le fichier n'existe pas
  }
});

// Route pour servir la page principale de l'application (le front-end)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
  console.log('Data file:', DATA_FILE);
});

// POST /report  -> body: { id, dilemma, at }
app.post('/report', (req, res) => {
  const report = req.body;
  const rptFile = path.join(__dirname, 'reports.json');
  let reports = [];
  if (fs.existsSync(rptFile)) reports = JSON.parse(fs.readFileSync(rptFile,'utf8')||'[]');
  reports.push(report);
  fs.writeFileSync(rptFile, JSON.stringify(reports, null, 2));
  res.json({ ok:true });
});

// POST /submit  -> body: new dilemma (for moderation)
app.post('/submit', (req, res) => {
  const sub = req.body;
  const subFile = path.join(__dirname, 'submissions.json');
  let subs = [];
  if (fs.existsSync(subFile)) subs = JSON.parse(fs.readFileSync(subFile,'utf8')||'[]');
  subs.push(sub);
  fs.writeFileSync(subFile, JSON.stringify(subs, null, 2));
  res.json({ ok:true });
});