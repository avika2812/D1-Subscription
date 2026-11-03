
const express = require('express')
const cors = require('cors')
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const path = require('path')

const { getApps, initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')

require('dotenv').config()

// Firebase Admin setup
const serviceAccount = require('./.serviceAccountKey.json')

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
    })
}

const db = getFirestore()

// Express setup
const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in Backend .env file.')
}

// Mailgun setup
const mailgun = new Mailgun(formData)

const mg = process.env.MAILGUN_API_KEY
    ? mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
    })
    : null

const listAddress =
    'devdeakin@sandbox7b9f99966c0a4874b1adc771d7a599b6.mailgun.org'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// JWT verification middleware
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Please login first.',
        })
    }

    try {
        const token = authHeader.split(' ')[1]
        req.user = jwt.verify(token, JWT_SECRET)
        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired session.',
        })
    }
}

// Test backend
app.get('/', (req, res) => {
    res.send('DEV@Deakin newsletter backend is running.')
})

// Test Firestore connection
app.get('/test-firestore', async (req, res) => {
    try {
        await db.collection('users').limit(1).get()

        res.json({
            message: 'Firestore connection successful.',
        })
    } catch (error) {
        console.error('Firestore error:', error)

        res.status(500).json({
            error: 'Could not connect to Firestore.',
        })
    }
})

// Register user
app.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body

        if (
            typeof fullName !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !fullName.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: 'Full name, email and password are required.',
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address.',
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must contain at least 6 characters.',
            })
        }

        const existingUser = await db
            .collection('users')
            .where('email', '==', normalizedEmail)
            .limit(1)
            .get()

        if (!existingUser.empty) {
            return res.status(409).json({
                message: 'An account with this email already exists.',
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const userRef = db.collection('users').doc()

        await userRef.set({
            fullName: fullName.trim(),
            email: normalizedEmail,
            passwordHash,
            plan: 'Free',
            createdAt: new Date(),
        })

        return res.status(201).json({
            message: 'Registration successful. Please log in.',
            userId: userRef.id,
        })

    } catch (error) {
        console.error('Registration error:', error)

        return res.status(500).json({
            message: 'Registration failed. Please try again.',
        })
    }
})

// Login user and generate JWT
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: 'Email and password are required.',
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const users = await db
            .collection('users')
            .where('email', '==', normalizedEmail)
            .limit(1)
            .get()

        if (users.empty) {
            return res.status(401).json({
                message: 'Incorrect email or password.',
            })
        }

        const userDoc = users.docs[0]
        const userData = userDoc.data()

        if (!userData.passwordHash) {
            return res.status(401).json({
                message: 'Please use Google login for this account.',
            })
        }

        const passwordMatches = await bcrypt.compare(
            password,
            userData.passwordHash
        )

        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Incorrect email or password.',
            })
        }

        const token = jwt.sign(
            {
                userId: userDoc.id,
                email: userData.email,
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        )

        return res.json({
            message: 'Login successful.',
            token,
            user: {
                id: userDoc.id,
                fullName: userData.fullName || '',
                email: userData.email,
                plan: userData.plan || 'Free',
            },
        })

    } catch (error) {
        console.error('Login error:', error)

        return res.status(500).json({
            message: 'Login failed. Please try again.',
        })
    }
})

// Google login
app.post('/google-login', async (req, res) => {
    try {
        const { idToken } = req.body

        if (!idToken) {
            return res.status(400).json({
                message: 'Google ID token is required.',
            })
        }

        const decodedToken = await getAuth().verifyIdToken(idToken)

        if (!decodedToken.email || !decodedToken.email_verified) {
            return res.status(401).json({
                message: 'A verified Google email is required.',
            })
        }

        const email = decodedToken.email.trim().toLowerCase()

        const users = await db
            .collection('users')
            .where('email', '==', email)
            .limit(1)
            .get()

        let userRef
        let userData

        if (users.empty) {
            userRef = db.collection('users').doc()

            userData = {
                fullName: decodedToken.name || '',
                email,
                plan: 'Free',
                authProvider: 'google',
                createdAt: new Date(),
            }

            await userRef.set(userData)

        } else {
            userRef = users.docs[0].ref
            userData = users.docs[0].data()
        }

        const token = jwt.sign(
            {
                userId: userRef.id,
                email,
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        )

        return res.json({
            message: 'Google login successful.',
            token,
            user: {
                id: userRef.id,
                fullName: userData.fullName || decodedToken.name || '',
                email,
                plan: userData.plan || 'Free',
            },
        })

    } catch (error) {
        console.error('Google login error:', error)

        return res.status(401).json({
            message: 'Google login failed. Please try again.',
        })
    }
})

// Get the logged-in user's plan
app.get('/my-plan', verifyJWT, async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.user.userId)
        const userSnapshot = await userRef.get()

        if (!userSnapshot.exists) {
            return res.status(404).json({
                message: 'User not found.',
            })
        }

        const userData = userSnapshot.data()

        return res.json({
            plan: userData.plan || 'Free',
            planType: userData.planType || null,
            billingPeriod: userData.billingPeriod || null,
        })

    } catch (error) {
        console.error('Plan check error:', error)

        return res.status(500).json({
            message: 'Could not check your current plan.',
        })
    }
})

// Upgrade the logged-in user's plan
app.post('/upgrade', verifyJWT, async (req, res) => {
    try {
        const { planType, billingPeriod } = req.body

        const validPlanTypes = ['Pro', 'Premium']
        const validBillingPeriods = ['monthly', 'yearly']

        if (
            !validPlanTypes.includes(planType) ||
            !validBillingPeriods.includes(billingPeriod)
        ) {
            return res.status(400).json({
                message: 'Please select a valid plan and billing period.',
            })
        }

        const userRef = db.collection('users').doc(req.user.userId)
        const userSnapshot = await userRef.get()

        if (!userSnapshot.exists) {
            return res.status(404).json({
                message: 'User not found.',
            })
        }

        const userData = userSnapshot.data()

        if ((userData.plan || 'Free') === 'Paid') {
            return res.status(409).json({
                message: 'You already have a Paid plan.',
            })
        }

        await userRef.update({
            plan: 'Paid',
            planType,
            billingPeriod,
            updatedAt: new Date(),
        })

        return res.json({
            message: 'Plan upgraded successfully.',
            user: {
                id: userRef.id,
                email: userData.email,
                plan: 'Paid',
                planType,
                billingPeriod,
            },
        })

    } catch (error) {
        console.error('Upgrade error:', error)

        return res.status(500).json({
            message: 'Could not upgrade your plan. Please try again.',
        })
    }
})

// Create a new post
app.post('/posts', verifyJWT, async (req, res) => {
    try {
        const { title, type, plan, tags, text, abstract, article } = req.body

        // Validate post type
        if (!['question', 'article'].includes(type)) {
            return res.status(400).json({
                message: 'Please select a valid post type.',
            })
        }

        // Validate title
        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                message: 'Please enter a title.',
            })
        }

        // Validate tags
        if (
            !Array.isArray(tags) ||
            tags.length < 1 ||
            tags.length > 3 ||
            tags.some(tag => typeof tag !== 'string' || !tag.trim())
        ) {
            return res.status(400).json({
                message: 'Please add between 1 and 3 valid tags.',
            })
        }

        // Validate selected post plan
        if (!['Free', 'Paid'].includes(plan)) {
            return res.status(400).json({
                message: 'Please select a valid post plan.',
            })
        }

        // Get logged-in user's details
        const userRef = db.collection('users').doc(req.user.userId)
        const userSnapshot = await userRef.get()

        if (!userSnapshot.exists) {
            return res.status(404).json({
                message: 'User not found.',
            })
        }

        const userData = userSnapshot.data()

        // Free users cannot create Paid posts
        if (plan === 'Paid' && userData.plan !== 'Paid') {
            return res.status(403).json({
                message: 'Upgrade to a Paid plan to create Paid posts.',
            })
        }

        // Prepare post data
        const postData = {
            title: title.trim(),
            type: type,
            plan: plan,
            tags: tags.map(tag => tag.trim()),
            userId: req.user.userId,
            createdAt: FieldValue.serverTimestamp(),
        }

        // Add question content
        if (type === 'question') {
            if (typeof text !== 'string' || !text.trim()) {
                return res.status(400).json({
                    message: 'Please enter your question.',
                })
            }

            postData.text = text.trim()
        }

        // Add article content
        if (type === 'article') {
            if (
                typeof abstract !== 'string' ||
                !abstract.trim() ||
                typeof article !== 'string' ||
                !article.trim()
            ) {
                return res.status(400).json({
                    message: 'Please enter the article abstract and content.',
                })
            }

            postData.abstract = abstract.trim()
            postData.article = article.trim()
        }

        // Save post in Firestore
        const postRef = await db.collection('posts').add(postData)

        return res.status(201).json({
            message: 'Post submitted successfully.',
            postId: postRef.id,
        })

    } catch (error) {
        console.error('Error creating post:', error)

        return res.status(500).json({
            message: 'Unable to create post. Please try again.',
        })
    }
})

// Get posts for Browse Posts page
app.get('/posts', async (req, res) => {
    try {
        let userPlan = 'Free'

        // Check whether the visitor is logged in
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const decodedToken = jwt.verify(token, JWT_SECRET)

            // Get the user's actual plan from Firestore
            const userRef = db.collection('users').doc(decodedToken.userId)
            const userSnapshot = await userRef.get()

            if (!userSnapshot.exists) {
                return res.status(404).json({
                    message: 'User not found.',
                })
            }

            userPlan = userSnapshot.data().plan || 'Free'
        }

        // Get posts from Firestore
        let postsQuery = db.collection('posts')

        // Free visitors and users can only receive Free posts
        if (userPlan !== 'Paid') {
            postsQuery = postsQuery.where('plan', '==', 'Free')
        }

        const snapshot = await postsQuery.get()

        // Get unique author IDs
        const authorIds = [
            ...new Set(
                snapshot.docs
                    .map(doc => doc.data().userId)
                    .filter(Boolean)
            )
        ]

        // Fetch author names
        const authorResults = await Promise.all(
            authorIds.map(async (userId) => {
                try {
                    const userSnapshot = await db
                        .collection('users')
                        .doc(userId)
                        .get()

                    const userData = userSnapshot.exists
                        ? userSnapshot.data()
                        : {}

                    let authorName =
                        userData.fullName ||
                        userData.displayName ||
                        userData.name

                    // If name is not in Firestore, check Firebase Authentication
                    if (!authorName) {
                        try {
                            let authUser

                            if (userData.email) {
                                authUser = await getAuth().getUserByEmail(
                                    userData.email
                                )
                            } else {
                                authUser = await getAuth().getUser(userId)
                            }

                            authorName = authUser.displayName
                        } catch (authError) {
                            console.log(
                                'Could not find author in Firebase Auth:',
                                userId
                            )
                        }
                    }

                    return {
                        userId,
                        name: authorName || 'Community Member',
                    }

                } catch (error) {
                    console.error('Author lookup error:', error)

                    return {
                        userId,
                        name: 'Community Member',
                    }
                }
            })
        )

        // Create author name lookup
        const authorNames = {}

        authorResults.forEach(author => {
            authorNames[author.userId] = author.name
        })

        // Prepare posts with author names
        const posts = snapshot.docs.map(doc => {
            const post = doc.data()

            return {
                id: doc.id,
                title: post.title || '',
                abstract: post.abstract || '',
                article: post.article || '',
                text: post.text || '',
                tags: post.tags || [],
                createdAt: post.createdAt && post.createdAt.toDate
                    ? post.createdAt.toDate().toISOString()
                    : null,
                type: post.type || '',
                plan: post.plan || 'Free',
                userId: post.userId || '',
                authorName: authorNames[post.userId] || 'Community Member',
            }
        })

        // Sort newest posts first
        posts.sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        })

        return res.json({ posts })

    } catch (error) {
        console.error('Error fetching posts:', error)

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            return res.status(401).json({
                message: 'Invalid or expired session.',
            })
        }

        return res.status(500).json({
            message: 'Unable to fetch posts.',
        })
    }
})

// Newsletter subscription — preserves the original root POST route
app.post('/', async (req, res) => {
    try {
        const email = req.body.email

        if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
            return res.status(400).send('Please provide a valid email address.')
        }

        if (!mg) {
            return res.status(500).send('Mailgun is not configured.')
        }

        const normalizedEmail = email.trim().toLowerCase()

        await mg.lists.members.createMember(listAddress, {
            address: normalizedEmail,
            subscribed: true,
            upsert: 'yes',
        })

        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `DEV@Deakin <mailgun@${process.env.MAILGUN_DOMAIN}>`,
            to: [normalizedEmail],
            subject: 'Welcome to DEV@Deakin',
            text: 'Thank you for subscribing to DEV@Deakin!',
        })

        return res.send('Successfully subscribed to the newsletter.')

    } catch (error) {
        console.error('Newsletter error:', error)

        return res.status(500).send('Newsletter subscription failed.')
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`)
})

