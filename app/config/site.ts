// The app's identity: the document title and description, the header and
// footer brand, the source link and the document language. vitex create
// writes it from the project's answers; edit it freely.
type Site = {
  title: string;
  description: string;
  repository: string;
  lang: string;
};

export const site: Site = {
  title: 'Pum',
  description: 'Universal React with server-side rendering and Node.js',
  repository: 'https://github.com/jetmirshatri/pum',
  lang: 'en'
};
