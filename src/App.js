import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Location } from "@reach/router";
import DevTools from './DevTools';
import FakeBrowserWindow from './FakeBrowserWindow';
import ROUTES from './routes';
 
import './App.css';

function loadBabel(iframe, scriptSource) {
  fetch(scriptSource)
    .then(response => response.text())
    .then(input => {
    const { contentDocument } = iframe;

    // eslint-disable-next-line no-undef
    const { code } = Babel.transform(input, { presets: ['es2015', 'react'] });

    const script = contentDocument.createElement('script');
    script.textContent = code;

    contentDocument.head.appendChild(script);
  });
}

function loadScript(iframe, scriptSource, onLoadFn) {
  const { contentDocument } = iframe;

  const script = contentDocument.createElement('script');
  script.addEventListener('load', onLoadFn);
  script.src = scriptSource;

  contentDocument.head.appendChild(script);
}

function BackAndNextButtons({ pathname }) {
  const routesArray = useMemo(() => Object.keys(ROUTES), []);
  const routeIndex = useMemo(() => routesArray.indexOf(pathname), [pathname, routesArray]);

  if (pathname === '/') {
    return null;
  }

  return (
    <div className="LeftMiddle">
      {routeIndex > 0 ? (
        <Link className="LeftMiddleLink" to={routesArray[routeIndex - 1]}>« Prev</Link>
      ) : <span>« Prev</span>}
      <Link className="LeftMiddleLink" to="/">Home</Link>
      {routeIndex < routesArray.length - 1 ? (
        <Link className="LeftMiddleLink" to={routesArray[routeIndex + 1]}>Next »</Link>
      ) : <span>Next »</span>}
    </div>
  );
}

export default function App({
  children,
  defaultTabID = 'components',
  iframeSource = 'example-todo-list-app.js',
  title
}) {
  const iframeRef = useRef(null);
  const [tabID, setTabID] = useState(defaultTabID);

  useEffect(() => {
    if (iframeSource) {
      const iframe = iframeRef.current;
      iframe.addEventListener('load', () => {
        // Load React, ReactDOM, and example app after hook has been installed.
        loadScript(iframe, 'https://unpkg.com/react@0.0.0-a1dbb852c/umd/react.development.js',
          () => loadScript(iframe, 'https://unpkg.com/react-dom@0.0.0-a1dbb852c/umd/react-dom.development.js',
            () => loadBabel(iframe, iframeSource)));
      });
    }
  }, [iframeSource]);

  return (
    <div className="App">
      <div className="Left">
        <div className="LeftTop">
          <h1 className="LeftTopHeader">{title}</h1>
        </div>
        <Location>
          {({ location }) => <BackAndNextButtons pathname={location.pathname} />}
        </Location>
        <div className="LeftBottom">
          {children}
        </div>
      </div>
      <div className="Right">
        <FakeBrowserWindow url={title}>
          <iframe
            key={iframeSource}
            ref={iframeRef}
            className="Frame"
            title="Demo app"
            src="/empty.html">
          </iframe>
          <div className="TabBar">
            <div
              className={tabID === 'components' ? 'TabActive' : 'Tab'}
              onClick={() => setTabID('components')}
            >
              <span className="ReactIcon" role="img" aria-label="React Components tab button">⚛️</span>
              Components
            </div>
            <div
              className={tabID === 'profiler' ? 'TabActive' : 'Tab'}
              onClick={() => setTabID('profiler')}
            >
              <span className="ReactIcon" role="img" aria-label="React Profiler tab button">⚛️</span>
              Profiler
            </div>
          </div>
          <div className="DevTools">
            <DevTools
              hidden={tabID !== 'components' && tabID !== 'profiler'}
              iframeRef={iframeRef}
              tabID={tabID}
            />
          </div>
        </FakeBrowserWindow>
      </div>
    </div>
  );
}