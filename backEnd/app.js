const express = require("express")
const mongoose = require("mongoose")
const app = express()

app.use(express.json())
require("dotenv").config();

const Exercise = mongoose.model('Exercise', { 
    name: String,
    img_url: String,
    description: String,
    muscle: { type: mongoose.Schema.Types.ObjectId, ref: 'Muscle' } // Referência ao músculo

});

// GET exercises by muscle
app.get("/exercise/:muscle", async (req, res) => {
    try {
        const muscleName = req.params.muscle;
        const exercises = await Exercise.find({}).populate({
            path: 'muscle',
            match: { name: muscleName } // Filtrar pelo nome do músculo
        }).exec();
        const filteredExercises = exercises.filter(exercise => exercise.muscle !== null);
        return res.send(filteredExercises);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});
  
app.delete("/exercise/:id", async (req, res) =>{
    const exercise = await Exercise.findByIdAndDelete(req.params.id)
    return res.send(exercise);
})

app.put("/exercise/:id", async(req, res) => {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, {
        name:req.body.name,
        img_url: req.body.img_url,
        description:req.body.description
    },{
        new:true
    })
    return res.send(exercise);
})

app.post("/exercise", async (req, res) => {
    try {
        const { name, img_url, description, muscleId } = req.body;
        // Verifique se o músculo existe
        const muscleExists = await Muscle.findById(muscleId);
        if (!muscleExists) {
            return res.status(400).send("Músculo não encontrado");
        }
        // Crie o novo exercício com a referência ao músculo
        const exercise = new Exercise ({
            name,
            img_url,
            description,
            muscle: muscleId // Referenciar o músculo pelo _id
        });
        await exercise.save();
        return res.send(exercise);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

//Muscle Entity
const Muscle = mongoose.model('Muscle', {
    name: String,
});

app.get("/muscle", async (req, res) => {
    const muscles = await Muscle.find();
    return res.send(muscles);
});
  
app.delete("/muscle/:id", async (req, res) =>{
    const muscle = await Muscle.findByIdAndDelete(req.params.id);
    return res.send(muscle);
});

app.put("/muscle/:id", async(req, res) => {
    const muscle = await Muscle.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
    },{
        new: true
    });
    return res.send(muscle);
});

app.post("/muscle", async (req, res) => {
    const muscle = new Muscle({
        name: req.body.name,
    });
    await muscle.save();
    return res.send(muscle);
});

require("./db")

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
