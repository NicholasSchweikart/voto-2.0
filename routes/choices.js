var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	// Comment out this line:
  //res.send('respond with a resource');

  // And insert something like this instead:
  res.json([{id: 'A'}, {id: 'B'}, {id: 'C'}, {id: 'C'}, {id: 'C'}, {id: 'C'}, {id: 'C'}, {id: 'C'}, {id: 'C'},{id: 'C'}, {id: 'C'}]);
});

module.exports = router;