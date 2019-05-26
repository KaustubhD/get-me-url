const dns = require('dns')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(process.env.URI)

var urlSchema = new mongoose.Schema({
  code: {
    type: Number,
    required: [true, 'Need a shorting number']
  },
  url: {
    type: String,
    required: [true, 'Need a URL bro']
  }
})

var Url = mongoose.model('Url', urlSchema)


let getMeShort = async (req, res) => {
  
  let u = req.body.url
  
  if(!isValid(u)){
    return res.json({ "error": 'Invalid URL' })
  }
  
  const record = await isExisting(u)
  if(record)
    return res.json({
      "original_url": record.url,
      "short_url": `${req.hostname}/api/shorturl/${record.code}`
    })
  
  // If doesn't exist
  let newCode = await getNewCode()
  
  
  console.log('New Code ' +  newCode + '\nUrl ' + u)
  let temp = new Url({
    code: newCode,
    url: u
  })
  console.log(temp)
  await temp.save()
  return res.json({
    "original_url": u,
    "short_url": `${req.hostname}/api/shorturl/${newCode}`
  })
}





let getNewCode = async () => {
  return Url.countDocuments({}).exec()
    .then(count => {
      return count
    })
    .catch(err => err)
}


let isExisting = async (url) => {
  let rec = await Url.findOne({ url })
  console.log('Return from isExisting : ' + rec)
  return rec
}


let isValid = (url) => {
  return dns.lookup(url, (err, add) => {
    if(err) return false
    return true
  })
}

module.exports = {
  getMeShort
}