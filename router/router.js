const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');
const cartController = require('../controller/CartController');
const productsController = require('../controller/productsController');
const userController = require('../controller/UsersController');
const Category = require('../model/CatogaryModel');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `prod-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// const transporter = nodemailer.createTransport({
//     service: process.env.EMAIL_SERVICE || 'gmail',
//     auth: {
//         user: user.email,
//         pass : user.password
//     }
// });

router.post('/login', userController.login);
router.post('/signup', userController.signup);

router.get('/users/me', protect, (req, res) => {
    res.json({
        state: 1,
        data: req.user
    });
});

router.put('/:userId', userController.validateUpdate, userController.updateUser);

router.post('/addproducts', upload.single('image'), productsController.addProduct);
router.get('/products', productsController.getAllProducts);
router.get('/products/:id', productsController.getProductById);

router.get('/cart/:userId', protect, cartController.getCart);
router.post('/cart/add', protect, cartController.addToCart);
router.put('/cart/update', protect, cartController.updateCartItem);
router.delete('/cart/remove', protect, cartController.removeCartItem);

// router.post('/cart/send-email', protect, async (req, res) => {
//   try {
//     const { cartItems, total } = req.body;
//     const user = req.user;

//     // Validate required parameters
//     if (!user.email) {
//       return res.status(400).json({
//         success: false,
//         message: 'User email not available'
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(user.email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user email format'
//       });
//     }

//     const storeEmail = process.env.STORE_EMAIL;
//     const storeName = process.env.STORE_NAME || "Our Store";

//     // Generate email content
//     const itemsHtml = cartItems.map(item => `
//       <tr>
//         <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
//         <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
//         <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
//         <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
//       </tr>
//     `).join('');

//     // Send email using store's SMTP with user's account email
//     // await transporter.sendMail({
//     //   from: user.email,
//     //   to: 'amhboom14@gmail.com',
//     //   subject: `Shopping Cart from ${user.name || user.email}`,
//     //   html: `
//     //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     //       <h2 style="color: #D97706;">Shopping Cart Details</h2>
//     //       <p><strong>Customer:</strong> ${user.name || 'No name provided'}</p>
//     //       <p><strong>Email:</strong> ${user.email}</p>
//     //       <p><strong>Contact:</strong> ${user.phone || 'No phone provided'}</p>
//     //       <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//     //         <thead>
//     //           <tr>
//     //             <th style="text-align: left; padding: 8px; border-bottom: 2px solid #D97706;">Item</th>
//     //             <th style="text-align: center; padding: 8px; border-bottom: 2px solid #D97706;">Qty</th>
//     //             <th style="text-align: right; padding: 8px; border-bottom: 2px solid #D97706;">Price</th>
//     //             <th style="text-align: right; padding: 8px; border-bottom: 2px solid #D97706;">Total</th>
//     //           </tr>
//     //         </thead>
//     //         <tbody>
//     //           ${itemsHtml}
//     //           <tr>
//     //             <td colspan="3" style="text-align: right; padding: 8px; font-weight: bold;">Total:</td>
//     //             <td style="text-align: right; padding: 8px; font-weight: bold;">$${total.toFixed(2)}</td>
//     //           </tr>
//     //         </tbody>
//     //       </table>
//     //       <p>This cart was shared directly from your website.</p>
//     //     </div>
//     //   `
//     // });

//     return res.json({
//       success: true,
//       message: 'Cart sent successfully'
//     });

//   } catch (error) {
//     console.error('Email sending error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to send cart email',
//       error: error.message
//     });
//   }
// });

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// router.post('/addcategories', protect, async (req, res) => {
//     try {
//         const { name } = req.body;

//         if (!name) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Category name is required'
//             });
//         }

//         const category = new Category({ name });
//         await category.save();

//         return res.status(201).json({
//             success: true,
//             data: category
//         });
//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

router.get('/', (req, res) => {
    res.json({
        msg: 'API is running 🚀',
        state: 1,
        endpoints: [
            '/login',
            '/signup',
            '/products',
            '/cart'
        ]
    });
});

module.exports = router;