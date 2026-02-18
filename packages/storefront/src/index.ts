// Register all Web Components
import './components/vault-banner';
import './components/vault-modal';
import './components/vault-toast';
import './components/vault-badge';
import './components/vault-timer';
import './components/vault-product-card';

// Main orchestrator
import { init } from './init';
import { log } from './services/logger';

log('script loaded, readyState=' + document.readyState);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
