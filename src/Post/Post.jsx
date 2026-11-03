import { useState } from 'react'
import Question from './Question'
import Article from './Article'
import './Post.css'

function Post() {
    const [post, setPost] = useState("")
    const [plan, setPlan] = useState("")

    const handleOption = (e) => {
        setPost(e.target.value)
    }

    const handlePlan = (e) => {
        setPlan(e.target.value)
    }

    return (
        <>
            <div className="post-container">
                <h3 className="heading">New Post</h3>

                <form className="form-style">
                    <p>Select the post type:</p>

                    <div className="input-style">
                        <label>
                            <input
                                type="radio"
                                name="post"
                                value="question"
                                checked={post === 'question'}
                                onChange={handleOption}
                            />
                            Question
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="post"
                                value="article"
                                checked={post === 'article'}
                                onChange={handleOption}
                            />
                            Article
                        </label>
                    </div>

                    <p>Select Post Plan:</p>

                    <div className="input-style">
                        <label>
                            <input
                                type="radio"
                                name="plan"
                                value="Free"
                                checked={plan === 'Free'}
                                onChange={handlePlan}
                            />
                            Free
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="plan"
                                value="Paid"
                                checked={plan === 'Paid'}
                                onChange={handlePlan}
                            />
                            Paid
                        </label>
                    </div>
                </form>

                {post === 'question' && <Question plan={plan} />}
                {post === 'article' && <Article plan={plan} />}
            </div>
        </>
    )
}

export default Post