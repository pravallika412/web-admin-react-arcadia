import { createGlobalStyle, css } from "styled-components";
// import { fontSizes, gapSizes, screenSizes, Theme } from './theme'
// import TomatoGrotesk from '../../assets/fonts/Tomato_Grotesk/'
// import NunitoSansBlack from '../assets/fonts/NunitoSans/NunitoSans-Black.ttf'
// import { rgba } from 'polished'
// import TomatoGrotesk from '../../assets/fonts/Tomato_Grotesk';

export const LinkStyle = css`
  color: ${(props) => props.theme.accent};
  cursor: pointer;
`;
export const GlobalStyle = createGlobalStyle`
input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active  {
    transition: background-color 5000s ease-in-out 0s;
    -webkit-text-fill-color: white !important;
  }
font-family: 'TomatoGrotesk';
  :root {
    transition: margin 300ms ease-in-out;
    --pageMargin: 80px;
  }

  @font-face {
    font-family: 'TomatoGrotesk';
    src: url('../../assets/fonts/Tomato_Grotesk/TomatoGrotesk-Regular.otf');
    font-weight: normal;
    font-style: normal;
  }

  h1, h2, h3, h4 {
    margin: 0;
  }

  body {
    font-family: 'TomatoGrotesk';
  }
`;
