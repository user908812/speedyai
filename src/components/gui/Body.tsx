import { useRef, useState } from 'react';
import { GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Space } from '../other/Space';
import LoadingGIF from '../../assets/gifs/loading.gif'

type CopyStatus = 'Success' | 'Failure' | 'Copy response';

function Body() {
  const [inputValue, setInputValue] = useState<string>('');
  const [responses, setResponses] = useState<Array<string>>([]);
  const [error, setError] = useState<string>('');
  const [prevInputValue, setPrevInputValue] = useState<string>('');
  const [userMessages, setUserMessages] = useState<Array<string>>([]);
  const [botMessageDone, setBotMessageDone] = useState<boolean>(true);
  const [copySTatus, setCopyStatus] = useState<CopyStatus>('Copy response');
  const [botResponse, setBotResponse] = useState<string>('');
  const [textOnLoad, setTextOnLoad] = useState<string>("Welcome to our AI-powered chatbot! Designed to provide instant assistance and insightful responses, our chatbot is here to help you with a variety of tasks, answer questions, and engage in meaningful conversations. Whether you're looking for information, support, or just a friendly chat, our chatbot is always ready to assist you 24/7.");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const genAI: GoogleGenerativeAI = new GoogleGenerativeAI('AIzaSyDPqSDFqps2hfip-gpbjkWFO-OOUuqA25s');
  const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async function getResponse(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      if (inputValue.length === 0 || inputValue.trim() === '') {
        setError('You have to enter a message first!');
      } else {
        setBotMessageDone(false);
        setTextOnLoad('');
        setPrevInputValue(inputValue);
        const result: GenerateContentResult = await model.generateContent(inputValue);
        const responseText: string = result.response.text();
        setBotResponse(responseText);
        setResponses([...responses, responseText]);
        setInputValue('');
        setUserMessages([...userMessages, prevInputValue]);
        setBotMessageDone(true);
        inputRef.current?.focus();
      }
    } catch (error: unknown) {
      setError(`An error occured: (${error})`);
      console.error(`An error occured: (${error})`);
    }
  };

  function onUserTextChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setInputValue(e.target.value);
    setError('');
  }
  function clearAllChat(): void {
    setResponses([]);
    setInputValue('');
    setError('');
    setPrevInputValue('');
  }
  function copyResponse() {
    navigator.clipboard.writeText(botResponse)
    .then(() => {
      setCopyStatus('Success')
      setTimeout(() => {
        setCopyStatus('Copy response');
      }, 2000);
    })
    .catch(error => {
      setCopyStatus('Failure')
      setTimeout(() => {
        setCopyStatus('Copy response');
      }, 2000);
      console.log(error);
    });
  }

  return (
    <main>
      <div>
          {textOnLoad && <div id='textOnLoad'>{textOnLoad}</div>}
          {prevInputValue.trim() !== '' && <p>[🧑]: {prevInputValue}</p>}
          {responses.map((response, i) => (
            <p className='bot-response' key={i}>[🤖]: {response}</p>
          ))}
          {!botMessageDone && <img style={{width: '60px', height: '60px'}} draggable={false} src={LoadingGIF} />}
      </div>

      <Space spaces={10} />

      <form onSubmit={getResponse}>
        <div className='form-content'>
            <textarea ref={inputRef} name="userTextInput" id="userTextInput" value={inputValue} placeholder='Enter your message...' onChange={onUserTextChange} required autoFocus autoComplete='on' />
            <button id='send-button' type='submit'>Send</button>
            <button id='clear-button' onClick={clearAllChat}>Clear</button>
            <button id='copy-res-button' onClick={copyResponse}>{copySTatus}</button>
            {error && <div className='inputErrMsg'>⚠️{error}</div>}
        </div>
      </form>

    </main>
  );
};

export default Body;