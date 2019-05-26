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

var URL = mongoose.model('Url', urlSchema)

let getMeShort = async (req, res) => {
  let u = req.params.url
  
  if(!isValid(u)){
    return res.json({ error: 'Invalid URL' })
  }
  
  const record = await isExisting(u)
  if(record)
    return res.json({
      original_url: record.url,
      short_url: record.code
    })
  
  // If doesn't exist
  let newCode = await URL.countDocuments({}).exec((err, count) => count)
  let temp = new URL({
    code: newCode,
    url: u
  }).save()
  
  return {
    original_url: u,
    short_url: newCode
  }
}








let isExisting = async (url) => {
  let rec = await URL.findOne({ url })
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