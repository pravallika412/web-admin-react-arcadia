import { createGlobalStyle, css } from "styled-components";
import TomatoGrotesk from "../../fonts/TomatoGrotesk-Regular.otf";

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
  }
  :root {
    transition: margin 300ms ease-in-out;
    --pageMargin: 80px;
  }

  @font-face {
    font-family: 'TomatoGrotesk';
    src: url(${TomatoGrotesk});
    font-weight: normal;
    font-style: normal;
  }

  h1, h2, h3, h4 {
    margin: 0;
  }

  body {
    font-family: 'TomatoGrotesk', sans-serif;
  }
`;
