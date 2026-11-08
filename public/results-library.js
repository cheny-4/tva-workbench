/* Saved outputs remain in the selected VISTA project's output directory. */
(function (global) {
  'use strict';
  const INLINE_IMAGES = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
  const FIGURES = new Set([...INLINE_IMAGES, 'svg', 'tif', 'tiff', 'eps']);
  const DATA = new Set(['csv', 'tsv', 'json', 'geojson', 'parquet', 'feather', 'xlsx', 'xls', 'nc', 'h5', 'hdf5', 'npy', 'npz']);
  const REPORTS = new Set(['pdf', 'md', 'txt', 'docx', 'doc', 'rtf', 'html']);
  const CATEGORIES = [['all', 'All results'], ['figures', 'Figures'], ['data', 'Data'], ['reports', 'Reports'], ['other', 'Other']];
  let revision = 0;
  let activeProject = null;
  let selectedCategory = 'all';
  let searchText = '';

  function extension(name) { return String(name).split('/').pop().split('.').slice(1).pop()?.toLowerCase() || ''; }
  function category(name) {
    const ext = extension(name);
    return FIGURES.has(ext) ? 'figures' : DATA.has(ext) ? 'data' : REPORTS.has(ext) ? 'reports' : 'other';
  }
  function canPreview(name) { return INLINE_IMAGES.has(extension(name)); }
  function validName(name) {
    return typeof name === 'string' && name.length > 0 && name.length <= 4096 &&
      !name.startsWith('/') && !/[\\\u0000-\u001f\u007f]/.test(name) &&
      name.split('/').every(part => part !== '' && part !== '.' && part !== '..');
  }
  function time(value) { const stamp = typeof value === 'string' ? Date.parse(value) : NaN; return Number.isFinite(stamp) ? stamp : null; }
  function normalizeFiles(payload) {
    if (!Array.isArray(payload)) throw new Error('VISTA returned an invalid output listing. Refresh the library after checking the connection.');
    const seen = new Set();
    return payload.filter(file => file && typeof file === 'object' && validName(file.name) && !seen.has(file.name) && seen.add(file.name)).map(file => ({
      name: file.name,
      size: typeof file.size === 'number' && Number.isFinite(file.size) && file.size >= 0 ? file.size : null,
      modified: time(file.modified), created: time(file.created),
      category: category(file.name), preview: canPreview(file.name)
    })).sort((a, b) => (b.modified ?? b.created ?? -Infinity) - (a.modified ?? a.created ?? -Infinity) || a.name.localeCompare(b.name));
  }
  function filterFiles(files, filter, query) {
    const search = String(query || '').trim().toLocaleLowerCase();
    return files.filter(file => (filter === 'all' || file.category === filter) && (!search || file.name.toLocaleLowerCase().includes(search)));
  }
  function sizeLabel(bytes) {
    if (bytes === null) return 'Size unavailable';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toLocaleString(undefined, {maximumFractionDigits: 1}) + ' KB';
    return (bytes / (1024 * 1024)).toLocaleString(undefined, {maximumFractionDigits: 1}) + ' MB';
  }
  function dateLabel(file) {
    const stamp = file.modified ?? file.created;
    if (stamp === null) return 'Date unavailable';
    return (file.modified !== null ? 'Modified ' : 'Created ') + new Date(stamp).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'});
  }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char])); }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function empty(container, heading, description) {
    const wrapper = node('div', 'results-library-empty');
    wrapper.append(node('strong', '', heading), node('p', '', description));
    container.replaceChildren(wrapper);
  }
  function outputURL(fileUrl, name) {
    const url = fileUrl('outputs', name);
    if (typeof url !== 'string' || !url.startsWith('/api/vista/')) throw new Error('Invalid local output link.');
    return url;
  }
  function showFigure(file, url, options) {
    const caption = `${sizeLabel(file.size)} · ${dateLabel(file)}`;
    options.showDetails(file.name, `<figure class="results-library-figure"><img src="${escapeHTML(url)}?preview=true" alt="${escapeHTML(file.name)}"><figcaption>${escapeHTML(caption)}</figcaption></figure><p><a href="${escapeHTML(url)}" download>Download original figure ↗</a></p>`);
  }
  function buildCard(file, options) {
    const card = node('article', 'results-library-card');
    const url = outputURL(options.fileUrl, file.name);
    if (file.preview) {
      const preview = node('button', 'results-library-preview');
      preview.type = 'button';
      preview.setAttribute('aria-label', 'Preview ' + file.name);
      const image = node('img');
      image.src = url + '?preview=true';
      image.alt = file.name;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => preview.replaceChildren(node('span', '', 'Preview unavailable · open original')));
      preview.append(image);
      preview.addEventListener('click', () => showFigure(file, url, options));
      card.append(preview);
    } else {
      const type = node('div', 'results-library-filetype');
      type.append(node('span', '', extension(file.name).toUpperCase() || 'FILE'));
      card.append(type);
    }
    const content = node('div', 'results-library-card-content');
    const title = node('h3', '', file.name);
    title.title = file.name;
    content.append(title, node('p', 'results-library-filemeta', sizeLabel(file.size) + ' · ' + dateLabel(file)));
    const actions = node('div', 'results-library-actions');
    actions.append(node('span', 'tag quiet', CATEGORIES.find(item => item[0] === file.category)[1]));
    const download = node('a', 'text-button', 'Download ↧');
    download.href = url;
    download.download = file.name.split('/').pop();
    download.setAttribute('aria-label', 'Download ' + file.name);
    actions.append(download);
    content.append(actions);
    card.append(content);
    return card;
  }
  function mount(container, files, options) {
    container.replaceChildren();
    container.classList.add('results-library');
    const toolbar = node('div', 'results-library-toolbar');
    const filters = node('div', 'results-library-filters');
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', 'Result type');
    const input = node('input', 'results-library-search');
    input.type = 'search';
    input.placeholder = 'Find a saved result…';
    input.setAttribute('aria-label', 'Search saved results');
    input.value = searchText;
    const count = node('p', 'results-library-count');
    count.setAttribute('role', 'status');
    const grid = node('div', 'results-library-grid');
    const controls = [];
    function update() {
      for (const [name, button] of controls) button.setAttribute('aria-pressed', String(name === selectedCategory));
      const visible = filterFiles(files, selectedCategory, searchText);
      count.textContent = `${visible.length} of ${files.length} saved result${files.length === 1 ? '' : 's'}`;
      if (!visible.length) {
        empty(grid, 'No matching results.', 'Try another file type or search term.');
      } else {
        grid.replaceChildren(...visible.map(file => buildCard(file, options)));
      }
    }
    for (const [name, label] of CATEGORIES) {
      const button = node('button', '', label);
      button.type = 'button';
      button.addEventListener('click', () => { selectedCategory = name; update(); });
      controls.push([name, button]);
      filters.append(button);
    }
    input.addEventListener('input', () => { searchText = input.value; update(); });
    toolbar.append(filters, input);
    container.append(toolbar, count, grid);
    update();
  }
  async function render(options) {
    const id = ++revision;
    const container = document.querySelector('#live-files');
    const count = document.querySelector('#file-count');
    if (!container) return 0;
    if (options.project !== activeProject) {
      activeProject = options.project;
      selectedCategory = 'all';
      searchText = '';
    }
    if (count) count.textContent = '—';
    if (!options.projectFound) {
      empty(container, 'Connect your TVA project.', 'Open VISTA and check Connection settings to view saved figures, data and reports.');
      return 0;
    }
    empty(container, 'Loading saved results…', 'Reading this project’s output files from VISTA.');
    try {
      const files = normalizeFiles(await options.api(options.projectUrl('/outputs')));
      if (id !== revision) return 0;
      if (count) count.textContent = String(files.length);
      if (!files.length) {
        empty(container, 'Your Results Library is ready.', 'Ask the agent to save generated figures, data and reports to the project’s outputs. They will appear here after the agent finishes or you refresh.');
      } else {
        mount(container, files, options);
      }
      return files.length;
    } catch (error) {
      if (id !== revision) return 0;
      empty(container, 'Results are unavailable.', error?.message || 'Check the VISTA connection, then refresh the library.');
      return 0;
    }
  }
  const library = {render, category, canPreview, validName, normalizeFiles, filterFiles};
  global.TVAResultsLibrary = library;
  if (typeof module !== 'undefined' && module.exports) module.exports = library;
})(typeof window !== 'undefined' ? window : globalThis);
