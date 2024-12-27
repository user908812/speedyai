import Logo from '../../assets/images/logo.png'

function Header() {
    return(
        <header>
            <img id='app-logo' src={Logo} alt="app-logo" draggable={false} />
            <h1 id='app-name'>SpeedyAI<span id='app-version'>v1</span></h1>
        </header>
    );
}
export default Header