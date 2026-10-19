import { ViewTransition } from 'react';

// Each page's content, so a navigation (a React transition, with
// experimental.viewTransition on) lifts the old page away and settles the new
// one in. The animations are .page-out and .page-in in globals.css; nothing
// plays on a first load.
export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <ViewTransition enter='page-in' exit='page-out' default='none'>
    {children}
  </ViewTransition>
);

// The links that are the same place on every page: the landing's tiles and
// the inner pages' pills share a name, so one morphs into the other, and the
// wordmark keeps its place. Only an old/new pair animates. Links to and from
// the landing pass LANDING as their transition type, which gets the tile/pill
// morph (.nav-morph in globals.css); between inner pages the pills stay put
// and take the plain crossfade, as does the wordmark, since the morph's
// rounded clip would nick its letters.
export const LANDING = ['landing'];

export const NavMorph = ({
  name,
  children,
}: {
  name: 'mariposa' | 'projects' | 'articles' | 'wordmark';
  children: React.ReactNode;
}) => (
  <ViewTransition
    name={`nav-${name}`}
    share={name === 'wordmark' ? 'auto' : { landing: 'nav-morph', default: 'auto' }}
    default='none'
  >
    {children}
  </ViewTransition>
);
