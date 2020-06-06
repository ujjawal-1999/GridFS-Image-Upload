const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');



app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));

const publicDirectory = __dirname+'/public';
app.use(express.static(publicDirectory));

const conn = mongoose.createConnection('mongodb://localhost:27017/imageUploadGridFs',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
});

let gfs;
conn.once('open', ()=>{
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads')
})

//Create Storage Object
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/imageUploadGridFs',
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
const upload = multer({ 
    storage:storage,
    limits:{fileSize:1000000} 
});

app.get('/',(req,res)=>{
  gfs.files.find().toArray((err,files)=>{
    if(err)
      throw new Error('Error occured');
    if(!files || files.length === 0){
      res.render('index',{
        files:false
      })
    }
    else{
      files.map(file=>{
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            file.isImage = true;
        }
        else{
          file.isImage = false;
        }
      })
      res.render('index',{
        files:files
      })
      }
    })
  })

//Post Route to upload file to DB
app.post('/upload',upload.single('file'),(req,res)=>{
    res.redirect('/');
})

//Get Route to view all files
app.get('/files',(req,res)=>{
  gfs.files.find().toArray((err,files)=>{
    if(err)
      throw new Error('Error occured');
    if(!files || files.length === 0)
      return res.status(404).json({
        err:'No files exist'
    })

    return res.json(files);

  })
})

//Get Route to view a particular file
app.get('/files/:filename',(req,res)=>{
  gfs.files.findOne({filename:req.params.filename},(err,file)=>{
    if(err)
      throw new Error('Error occured');
    if(!file || file.length === 0)
      return res.status(404).json({
        err:'No file exists'
    })

    return res.json(file);

  })
});

//Get Route to display a particular image /image/:filename
//Read Stream
app.get('/image/:filename',(req,res)=>{
  gfs.files.findOne({filename:req.params.filename},(err,file)=>{
    if(err)
      throw new Error('Error occured');
    if(!file || file.length === 0)
      return res.status(404).json({
        err:'No file exists'
    })

    //Check if image
    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
      //Create Read Stream
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    }
    else{
      res.status(404).json({
        error:'Not an Image'
      });
    }

  })
});

//Route DELETE /files/:id to delete a file

app.delete('/files/:id',(req,res)=>{
  gfs.remove({_id:req.params.id,root:'uploads'},(err,gridStore)=>{
    if(err)
      return res.status(404).json({error:err})
  })
  res.redirect('/');
})


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log('Server Up and Running on port',PORT);
})