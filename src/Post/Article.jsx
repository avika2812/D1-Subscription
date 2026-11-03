import './Post.css'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Swal from 'sweetalert2'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function Article({ plan }) {
    const [title, setTitle] = useState('')
    const [abstract, setAbstract] = useState('')
    const [article, setArticle] = useState('')
    const [tags, setTags] = useState('')
    const [loading, setLoading] = useState(false)

    const handlePost = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem('token')

        if (!token) {
            Swal.fire('Login Required', 'Please login before submitting an article.', 'warning')
            return
        }

        const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')

        if (!title.trim()) {
            Swal.fire('Missing Title', 'Please provide a suitable title.', 'warning')
            return
        }

        if (!abstract.trim()) {
            Swal.fire('Abstract Required', 'Please enter your abstract.', 'warning')
            return
        }

        if (!article.trim()) {
            Swal.fire('Article Required', 'Please enter your article text.', 'warning')
            return
        }

        if (tagList.length === 0 || tagList.length > 3) {
            Swal.fire('Invalid Tags', 'Please enter between 1 and 3 tags, separated by commas.', 'warning')
            return
        }

        try {
            setLoading(true)

            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title.trim(),
                    abstract: abstract.trim(),
                    article: article.trim(),
                    tags: tagList,
                    type: 'article',
                    plan
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Article submission failed.')
            }

            await Swal.fire({
                title: 'Article Submitted!',
                text: data.message || 'Your article has been saved successfully.',
                icon: 'success',
                confirmButtonText: 'Great!'
            })

            setTitle('')
            setAbstract('')
            setArticle('')
            setTags('')

        } catch (error) {
            Swal.fire('Error', error.message || 'Something went wrong.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="question-container">
            <span className="question">
                <h3>What do you want to ask or share?</h3>
            </span>

            <div className="form-style">
                <h3>Title :</h3>
                <input
                    type="text"
                    placeholder="Enter a descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <h3>Abstract</h3>
                <textarea
                    className="abstract-input"
                    placeholder="Enter a 1-paragraph abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                />

                <ReactMarkdown>{abstract}</ReactMarkdown>

                <h3>Article Text</h3>
                <textarea
                    className="text-input"
                    placeholder="Enter your article"
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                />

                <ReactMarkdown>{article}</ReactMarkdown>

                <h3>Tags</h3>
                <input
                    className="tags-input"
                    type="text"
                    placeholder="Add up to 3 tags, separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />

                <div className="button-style">
                    <button onClick={handlePost} disabled={loading}>
                        {loading ? 'Submitting...' : 'POST'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Article
