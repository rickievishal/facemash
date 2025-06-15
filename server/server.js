const express = require('express')
const mongoose = require('mongoose')
const cors = require("cors")
const multer = require("multer")
const Profile = require("./models/profile")
const app = express();

const PORT = process.env.PORT || 3000
const mogodbUri = "mongodb+srv://rickievishalytbec27:aG9jmQhC9yzPrw76@facemash.wjqphpf.mongodb.net/?retryWrites=true&w=majority&appName=Facemash"
mongoose.connect(mogodbUri, {
  serverSelectionTimeoutMS: 10000,
  ssl: true
})
    .then(()=>{console.log("connected")})
    .catch((err)=>{console.log("error connecting",err)})
const storage = multer.diskStorage({
    destination : (req,file,cb)=> {
        cb(null,'uploads/')
    },filename: (req,file,cb)=>{
        const uniqueName = Date.now() + file.originalname;
        cb(null,uniqueName)
    }
})
const upload = multer({storage:storage})
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.get("/",(req,res)=>{
    res.json({
        Name : "Inesh",
        id : "13413"
    });
})
app.post("/upload-profile",upload.single('image'),(req,res)=>{
    if (!req.file) return res.status(400).json({msg : "no photo uploaded"})
    const imgUrl = `http://localhost:3000/uploads/${req.file.filename}`
    res.status(200).json({imgUrl})
})
app.get("/getProfiles",async (req,res) => {
    const count = await Profile.countDocuments();
    if (count < 2) {
    return res.status(400).json({ msg: "Not enough profiles to compare." });
    }
    const randomIndexes = []
    while (randomIndexes.length < 2) {
        const rand = Math.floor(Math.random() * count);
        if (!randomIndexes.includes(rand)) randomIndexes.push(rand);
    }

    const firstProfile = await Profile.find().skip(randomIndexes[0]).limit(1);
    const secondProfile = await Profile.find().skip(randomIndexes[1]).limit(1);
    const payload = [
        firstProfile[0] , secondProfile[0]
    ]
    res.json(payload)
})
app.post("/uploadProfile",async(req,res)=>{
    try  {
        const newProfile = new Profile(req.body)
        await newProfile.save();
        res.status(201).json({ msg: "profile Saved" })
    }catch(err) {
        console.log(err)
        res.status(201).json({ msg: "profile not saved" })
    }
})
app.post('/updateProfiles', async (req, res) => {
  try {
    const updatedProfiles = req.body; 

    if (!Array.isArray(updatedProfiles) || updatedProfiles.length !== 2) {
      return res.status(400).json({ msg: 'Exactly two profiles required' });
    }

    const updatePromises = updatedProfiles.map((profile) => {
      return Profile.findByIdAndUpdate(profile._id, {
        eloRating: profile.eloRating,
      }, { new: true });
    });

    const result = await Promise.all(updatePromises);

    res.status(200).json({
      msg: 'Elo ratings updated successfully',
      updated: result
    });
  } catch (err) {
    console.error('Error updating profiles:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});
app.get("/leaderBoard", async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ eloRating: -1 });
    res.status(200).json(profiles);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

app.listen(PORT , ()=> {
    console.log(`The server is running on http://localhost:${PORT}`);
})