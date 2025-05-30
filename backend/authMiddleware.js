const jwt = require('jsonwebtoken');

     const verifyToken = (req, res, next) => {
       const token = req.headers['authorization']?.split(' ')[1];
       if (!token) {
         return res.status(401).json({ error: 'Token não fornecido' });
       }
       try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         req.user = { id: decoded.id, tipo: decoded.tipo };
         next();
       } catch (error) {
         return res.status(403).json({ error: 'Token inválido' });
       }
     };

     module.exports = verifyToken;