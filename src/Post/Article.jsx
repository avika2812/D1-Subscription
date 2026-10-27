import './Post.css'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Swal from 'sweetalert2'

function Article(){
    const [title, setTitle] = useState('')
    const [abstract, setAbstract] = useState('')
    const [article, setArticle] = useState('')
    const [tags, setTags] = useState('')
    
       
const handleAlert = () => {
    if (title.trim() === '') {
        Swal.fire({
            title: 'Missing Title',
            text: 'Please provide a suitable title.',
            icon: 'warning'
        })
        return
    }
    else if (abstract.trim() === '') {
        Swal.fire({
            title: 'Abstract Required',
            text: 'Please enter your abstract.',
            icon: 'warning'
        })
        return
    }

    else if (article.trim() === '') {
        Swal.fire({
            title: 'article text Required',
            text: 'Please enter your text.',
            icon: 'warning'
        })
        return
    }
    
    else if (tags.trim() === '') {
        Swal.fire({
            title: 'Tags Required',
            text: 'Please enter at least one tag.',
            icon: 'warning'
        })
        return
    }
    else {
        Swal.fire({
            title: 'Article Submitted!',
            text: 'Your Article has been submitted successfully.',
            icon: 'success',
            confirmButtonText: 'Great!'
        })

        setTitle('')
        setArticle('')
        setAbstract('')
        setTags('')
    }
}

    return(
        <>
        <div className="question-container">
        <span className="question">
        <h3>What dow you want to ask or share </h3>
        </span>
        
        <div className="form-style">
        <h3>Title : </h3>
        <input type="text" placeholder="Enter a descriptive title"
        value={title}  onChange={(e) => setTitle(e.target.value)}/>

        <h3>Abstract</h3>
        <br></br>
        <textarea className="abstract-input" placeholder='Enter a 1-paragraph abstract'
        value={abstract}  onChange={(e) => setAbstract(e.target.value)} />
        <ReactMarkdown>{abstract}</ReactMarkdown>
        

        <h3>Article Text </h3>
        <br></br>
        <textarea className="text-input" placeholder='Enter a 1-paragraph article'
        value={article}  onChange={(e) => setArticle(e.target.value)} />
        <ReactMarkdown>{article}</ReactMarkdown>

        <h3>Tags</h3>
        <input className="tags-input" type="text" placeholder="Please add upto 3 tags what your question is about e.g. Java"
        value={tags}  onChange={(e) => setTags(e.target.value)}/>
        <br></br>

        <div className="button-style">
        <button onClick={handleAlert}>POST</button>

        </div>
        </div>
        </div>
        </>
    )
}
export default Article