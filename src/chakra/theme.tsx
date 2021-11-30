import { extendTheme } from '@chakra-ui/react';
import colors from './colors';
import global from './global';
import { Button } from './components/Button';
import { Link } from './components/Link';
import { Table } from './components/Table';
import breakpoints from './breakpoints';

const theme = extendTheme({
  breakpoints,
  colors,
  styles: {
    global,
  },
  fonts: {
    body: 'Open Sans',
  },
  components: {
    Button,
    Link,
    Table,
  },
});

export default theme;
