const errorHandler = (err, req, res, next) => {      
    if (res.status !== 500) {        
        return res.json({
            message: err.message,
            error: {}
          });
    } else {
        return res.status(500).send({
            error: err.message
        });
    }     
};


module.exports = {
    errorHandler
};
