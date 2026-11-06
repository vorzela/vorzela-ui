export const PACKAGE_REQUIREMENTS = `{
  "dependencies": {
    "@tanstack/react-form": "^1.33.5",
    "@tanstack/react-table": "^9.3.1",
    "d3": "^7.9.2",
    "d3-sankey": "^0.12.3",
    "dompurify": "^3.4.17",
    "lucide-react": "^1.61.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "sugar-high": "^2.6.4"
  }
}`

export function componentScss(name: string) {
  return `// 1. Emit the tokens once, from app/styles/global.scss.
@use 'index' as vz;

@include vz.emit-color-tokens(':root', 'light');
@include vz.emit-space-tokens(':root');

// 2. Each component ships one CSS module next to it.
//    app/components/ui/${name}.tsx
//    import styles from './${name}.module.scss';
//    app/components/ui/${name}.module.scss
//    @use '../../styles' as vz;

// 3. Retune the kit after the global stylesheet.
:root {
  --primary: 217 91% 46%;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

// 4. The module API stays small:
//    background: vz.color('primary');
//    border-radius: vz.radius('xl');`
}
