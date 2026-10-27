import './Post.css'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Swal from 'sweetalert2'

function Question(){
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
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
    else if (text.trim() === '') {
        Swal.fire({
            title: 'Question Required',
            text: 'Please enter your question.',
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
            title: 'Question Submitted!',
            text: 'Your question has been submitted successfully.',
            icon: 'success',
            confirmButtonText: 'Great!'
        })

        setTitle('')
        setText('')
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
        <input type="text" placeholder="start your question with how, what, why etc." value={title} onChange={(e) => setTitle(e.target.value)}/>
        
        <h3>Describe your problem</h3>
        <br></br>
        <textarea className="text-input" value={text}  onChange={(e) => setText(e.target.value)}/>
            <ReactMarkdown>{text}</ReactMarkdown>

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
export default Question