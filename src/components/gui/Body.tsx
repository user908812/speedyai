import { useRef, useState } from 'react';
import { GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Space } from '../other/Space';
import LoadingGIF from '../../assets/gifs/loading.gif'

type CopyStatus = 'Success' | 'Failure' | '';

function Body() {
  const [inputValue, setInputValue] = useState<string>('');
  const [responses, setResponses] = useState<Array<string>>([]);
  const [error, setError] = useState<string>('');
  const [botMessageDone, setBotMessageDone] = useState<boolean>(true);
  const [copySTatus, setCopyStatus] = useState<CopyStatus>('');
  const [botResponse, setBotResponse] = useState<string>('');
  const [textOnLoad, setTextOnLoad] = useState<string>("Welcome to our AI-powered chatbot! Designed to provide instant assistance and insightful responses, our chatbot is here to help you with a variety of tasks, answer questions, and engage in meaningful conversations. Whether you're looking for information, support, or just a friendly chat, our chatbot is always ready to assist you 24/7. Click \"Ctrl + m\" to open settings menu.");
  const [styles, setStyles] = useState({
    background: 'linear-gradient(to top, #e9e993, #f1f12c, yellow, #2929f0,blue, #0303b6)',
    fontSize: 24,
    color: 'black'
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const genAI: GoogleGenerativeAI = new GoogleGenerativeAI('AIzaSyDPqSDFqps2hfip-gpbjkWFO-OOUuqA25s');
  const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const messageHistory = document.getElementById('messages-container') as HTMLDivElement | null;

  document.body.style.background = styles.background;
  document.body.style.color = styles.color;
  document.body.style.fontSize = styles.fontSize + 'px';
  window.addEventListener('keydown', onKeyClick);

  function onKeyClick(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'm') {
      const dialog = document.querySelector<HTMLDialogElement>('#settingsMenu');
      dialog?.showModal();
    }
  }

  async function getResponse(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      if (inputValue.length === 0 || inputValue.trim() === '') {
        setError('You have to enter a message first!');
      } else {
        renderUserMessage();
        setBotMessageDone(false);
        setTextOnLoad('');
        const result: GenerateContentResult = await model.generateContent(inputValue);
        const responseText: string = result.response.text();
        setBotResponse(responseText);
        setResponses([...responses, responseText]);
        setInputValue('');
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
    if (messageHistory !== null && messageHistory.firstChild !== null) {
      messageHistory.removeChild(messageHistory.firstChild);
    } else {
      setError('An error occured with message history.');
      console.error('An error occured with message history.');
    }
  }

  function copyResponse() {
    navigator.clipboard.writeText(botResponse)
    .then(() => {
      setCopyStatus('Success')
      setTimeout(() => {
        setCopyStatus('');
      }, 2000);
    })
    .catch(error => {
      setCopyStatus('Failure')
      setTimeout(() => {
        setCopyStatus('');
      }, 2000);
      setError('An error occured with copying text.');
      console.log(error);
    });
  }

  function renderUserMessage(): void {
    const msg: HTMLDivElement = document.createElement('div');
    msg.innerHTML = `[🧑]: ${inputValue}`;
    messageHistory?.append(msg);
  }

  function onThemeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const color: string = e.target.value;

    switch (color) {
      case 'default':
        setStyles({...styles, background: 'linear-gradient(to top, #e9e993, #f1f12c, yellow, #2929f0,blue, #0303b6)'})
        break;
      case 'redandblack':
        setStyles({...styles, background: 'linear-gradient(to top, #e24e4e, red, #131212, black)'})
        break;
      case 'orangeandblack':
        setStyles({...styles, background: 'linear-gradient(to top, #f3c33f, orange, #131212, black)'})
        break;
      case 'poland':
        setStyles({...styles, background: 'linear-gradient(to top, red, white, white)'})
        break;
      case 'golden':
        setStyles({...styles, background: 'linear-gradient(to top, #f5f7a3, yellow, gold, gold)'})
        break;
      default:
        setError('An error occured: invalid theme selected!');
        break;
    }
  }

  return (
    <main>

        <dialog id='settingsMenu'>
          <h1>
            <button id='close-settings-menu' onClick={() => document.querySelector<HTMLDialogElement>('#settingsMenu')?.close()}>x</button>
            Settings
          </h1>

          <hr />

          <Space />

          <div>
            <label htmlFor="themeSelect">Select a theme: </label>
            <select name="themeSelect" id="themeSelect" onChange={onThemeChange}>
              <optgroup label='Original'>
                <option value="default">Default</option>
                <option value="redandblack">Red and black</option>
              </optgroup>
              <optgroup label='Older'>
                <option value="orangeandblack">Orange and black</option>
                <option value="poland">Poland</option>
                <option value="golden">Golden</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="fontSizeInput">Font size: </label>
            <input type="number" name="fontSizeInput" id="fontSizeInput" min={1} value={styles.fontSize} onChange={e => setStyles({...styles, fontSize: parseInt(e.target.value)})} />
          </div>

          <div>
            <label htmlFor="colorInput">Text color: </label>
            <input type="color" name="colorInput" id="colorInput" value={styles.color} onChange={e => setStyles({...styles, color: e.target.value})} />
          </div>

        </dialog>

      <div id='messages-container'>
          {textOnLoad && <div id='textOnLoad'>{textOnLoad}</div>}
          {responses.map((response, i) => (
            <p className='bot-response' key={i}>[🤖]: {response}</p>
          ))}
          {!botMessageDone && <img style={{width: '60px', height: '60px'}} draggable={false} src={LoadingGIF} />}
      </div>

      <Space spaces={10} />

      <form onSubmit={getResponse}>
        <div className='form-content'>
            <textarea ref={inputRef} name="userTextInput" id="userTextInput" value={inputValue} placeholder='Enter your message...' onChange={onUserTextChange} required autoFocus autoComplete='on' />
            <button id='send-button' type='submit' title='Send message'></button>
            <button id='clear-button' onClick={clearAllChat} title='Clear messages'></button>
            <button id='copy-res-button' onClick={copyResponse} title='Copy bot response'>{copySTatus}</button>
            {error && <div className='inputErrMsg'>⚠️{error}</div>}
        </div>
      </form>

    </main>
  );
};

export default Body;