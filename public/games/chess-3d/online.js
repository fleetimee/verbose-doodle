(() => {
  const game = window.atelierChess;
  const el = (id) => document.getElementById(id);
  let copy = null;
  let state = null;
  let receivedAt = 0;
  let socket = null;
  let intent = null;
  let generation = 0;
  let retries = 0;
  let retryTimer = 0;
  let handshakeTimer = 0;
  let pendingMove = false;
  let phase = 'idle';
  let confirmation = '';
  let configured = false;
  let cancelTicket = null;
  const originalFooter = document.querySelector('footer').textContent;

  function requestId() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  const playerId = (() => {
    try {
      const saved = sessionStorage.getItem('atelier-online-player');
      if (saved) return saved;
      const id = requestId();
      sessionStorage.setItem('atelier-online-player', id);
      return id;
    } catch { return requestId(); }
  })();

  function remember(code) {
    try {
      if (code) sessionStorage.setItem('atelier-online-room', code);
      else sessionStorage.removeItem('atelier-online-room');
    } catch { /* Online play also works without session storage. */ }
  }

  function ticketUrl() {
    return new Promise((resolve, reject) => {
      const id = requestId();
      const cleanup = () => {
        clearTimeout(timer);
        window.removeEventListener('message', receive);
        cancelTicket = null;
      };
      const receive = (event) => {
        if (event.origin !== location.origin || event.source !== parent) return;
        if (event.data?.type !== 'chess:connection' || event.data.id !== id) return;
        cleanup();
        if (typeof event.data.url === 'string') resolve(event.data.url);
        else reject(new Error('ticket'));
      };
      const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 10000);
      cancelTicket = () => { cleanup(); reject(new Error('cancelled')); };
      window.addEventListener('message', receive);
      parent.postMessage({type: 'chess:connect', id}, location.origin);
    });
  }

  function stop() {
    generation++;
    clearTimeout(retryTimer);
    clearTimeout(handshakeTimer);
    cancelTicket?.();
    const old = socket;
    socket = null;
    old?.close();
  }

  function fail(message) {
    el('online-error').textContent = copy?.[message] || copy?.connectionError || '';
  }

  function reset(message = '') {
    stop();
    intent = null;
    state = null;
    phase = 'idle';
    pendingMove = false;
    confirmation = '';
    remember(null);
    game.restore();
    document.querySelector('footer').textContent = originalFooter;
    render();
    el('online-error').textContent = message;
  }

  function schedule(attempt) {
    if (attempt !== generation || !intent) return;
    pendingMove = false;
    phase = 'reconnecting';
    render();
    retries++;
    if (retries > 10) { phase = 'offline'; fail('connectionError'); render(); return; }
    retryTimer = setTimeout(() => connect(), Math.min(8000, 500 * 2 ** (retries - 1)));
  }

  async function connect() {
    stop();
    const attempt = generation;
    phase = retries ? 'reconnecting' : 'connecting';
    game.begin();
    render();
    try {
      const url = await ticketUrl();
      if (attempt !== generation || !intent) return;
      const ws = new WebSocket(url);
      socket = ws;
      handshakeTimer = setTimeout(() => ws.close(), 10000);
      ws.onopen = () => {
        if (attempt === generation) ws.send(JSON.stringify({...intent, playerId}));
      };
      ws.onmessage = (event) => {
        if (attempt !== generation) return;
        let message;
        try { message = JSON.parse(event.data); } catch { return; }
        clearTimeout(handshakeTimer);
        if (message.type === 'state') {
          if (!Array.isArray(message.moves) || !['w', 'b'].includes(message.you)) return;
          if (state?.code === message.code && state.version > message.version) return;
          state = message;
          receivedAt = performance.now();
          intent = {type: 'join', code: state.code};
          remember(state.code);
          phase = 'connected';
          retries = 0;
          pendingMove = false;
          confirmation = '';
          el('online-error').textContent = '';
          game.apply(state);
          render();
        } else if (message.type === 'error') {
          pendingMove = false;
          if (['room_not_found', 'room_full', 'server_full', 'invalid_clock', 'invalid_color'].includes(message.code)) {
            reset(copy[message.code] || copy.connectionError);
          } else { fail(message.code); render(); }
        } else if (message.type === 'closed') {
          stop();
          phase = 'closed';
          pendingMove = false;
          remember(null);
          fail(message.reason);
          render();
        }
      };
      ws.onclose = () => schedule(attempt);
      ws.onerror = () => ws.close();
    } catch {
      schedule(attempt);
    }
  }

  function send(type, extra = {}) {
    if (!socket || socket.readyState !== WebSocket.OPEN || phase !== 'connected') return false;
    socket.send(JSON.stringify({type, version: state?.version, ...extra}));
    return true;
  }

  function start(next) {
    if (intent) return;
    intent = next;
    retries = 0;
    el('online-error').textContent = '';
    void connect();
  }

  game.canMove = () => phase === 'connected' && state?.status === 'playing' && state.turn === state.you && !pendingMove;
  game.sendMove = (move) => {
    if (!game.canMove()) return;
    if (!send('move', {move})) { fail('retryMove'); return; }
    pendingMove = true;
    el('move-input').value = '';
    render();
  };
  game.render = render;

  function show(id, visible) { el(id).hidden = !visible; }
  function render() {
    if (!copy) return;
    show('online-lobby', !intent);
    show('online-session', !!intent);
    if (!intent) return;
    const connected = phase === 'connected';
    const playing = state?.status === 'playing';
    const done = state?.status === 'finished';
    const ownTurn = state?.turn === state?.you;
    const them = state?.you === 'w' ? state?.black : state?.white;
    const me = state?.you === 'w' ? state?.white : state?.black;
    el('online-room').value = state?.code || intent.code || '';
    el('online-status').textContent = phase === 'connecting' ? copy.connect
      : phase === 'reconnecting' ? copy.reconnect
      : !connected ? copy.connectionError
      : state.status === 'waiting' ? copy.share
      : !done && !them?.connected ? copy.offline
      : copy.onlineDetail.replace('{color}', state.you === 'w' ? copy.white.toLowerCase() : copy.black.toLowerCase());
    show('online-retry', ['offline', 'closed'].includes(phase) && phase !== 'closed');
    show('online-draw', connected && playing);
    el('online-draw').disabled = !!state?.drawOffer;
    el('online-draw').textContent = state?.drawOffer === state?.you ? copy.drawSent : copy.offerDraw;
    const offered = playing && state?.drawOffer && state.drawOffer !== state.you;
    show('online-accept', !!offered && connected);
    show('online-decline', !!offered && connected);
    const rematch = done && state?.rematch && state.rematch !== state.you;
    show('online-offer', !!offered || !!rematch);
    el('online-offer').textContent = offered ? copy.drawReceived : rematch ? copy.rematchReceived : '';
    show('online-resign', connected && playing);
    el('online-resign').textContent = confirmation === 'resign' ? copy.confirmResign : copy.resign;
    show('online-rematch', connected && done);
    el('online-rematch').textContent = rematch ? copy.acceptRematch : state?.rematch === state?.you ? copy.rematchSent : copy.rematch;
    el('online-rematch').disabled = !!state?.rematch && state.rematch === state.you;
    el('online-leave').textContent = confirmation === 'leave' && connected ? copy.confirmLeave : state?.status === 'waiting' ? copy.cancelRoom : copy.leave;
    show('online-cancel', !!confirmation);
    for (const id of ['new', 'undo', 'difficulty', 'side']) el(id).disabled = true;
    el('move-input').disabled = !game.canMove();
    el('move-form').querySelector('button').disabled = !game.canMove();
    document.querySelector('footer').textContent = copy.onlineFooter;
    if (!state) {
      el('status').textContent = copy.connect;
      el('status-detail').textContent = '';
      el('human-turn').textContent = el('computer-turn').textContent = '';
      return;
    }
    el('opponent-name').textContent = them?.name || copy.waiting;
    el('self-name').textContent = `${me?.name || ''} (${copy.you})`;
    el('human-color').textContent = `/ ${state.you === 'w' ? copy.white : copy.black}`;
    el('opponent-level').textContent = them ? (them.connected ? copy.opponent : copy.offline) : copy.share;
    el('human-turn').textContent = playing && ownTurn ? copy.yourTurn : '';
    el('computer-turn').textContent = playing && !ownTurn ? copy.theirTurn : '';
    el('status').textContent = done ? state.result === '1/2-1/2' ? copy.draw
      : (state.result === '1-0') === (state.you === 'w') ? copy.win : copy.loss
      : state.status === 'waiting' ? copy.waiting
      : pendingMove ? copy.pending : ownTurn && game.inCheck() ? copy.check : ownTurn ? copy.yourMove : copy.theirMove;
    el('status-detail').textContent = done ? (copy[state.reason] || copy.finished)
      : state.status === 'waiting' ? copy.share
      : ownTurn && game.inCheck() ? copy.protect
      : copy.onlineDetail.replace('{color}', state.you === 'w' ? copy.white.toLowerCase() : copy.black.toLowerCase());
    el('selection').textContent = done ? copy.finished : pendingMove ? copy.pending : ownTurn ? copy.yourMove : copy.theirMove;
    updateClocks();
  }

  function updateClocks() {
    if (!state || !intent) return;
    for (const [id, side] of [['self-clock', state.you], ['opponent-clock', state.you === 'w' ? 'b' : 'w']]) {
      const node = el(id);
      node.hidden = state.seconds === 0;
      if (!state.seconds) continue;
      let ms = side === 'w' ? state.whiteMs : state.blackMs;
      if (state.status === 'playing' && side === state.turn) ms -= performance.now() - receivedAt;
      const seconds = Math.max(0, Math.ceil(ms / 1000));
      const text = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      if (node.textContent !== text) node.textContent = text;
      node.classList.toggle('active', state.status === 'playing' && side === state.turn);
    }
  }

  el('online-create').onclick = () => start({type: 'create', color: el('online-side').value, seconds: Number(el('online-clock').value)});
  el('online-join-form').onsubmit = (event) => {
    event.preventDefault();
    start({type: 'join', code: el('online-code').value.trim().toUpperCase()});
  };
  el('online-code').oninput = () => { el('online-code').value = el('online-code').value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
  el('online-copy').onclick = async () => {
    try {
      if (!await window.copyGameText(el('online-room').value)) throw new Error('copy');
      el('online-error').textContent = '';
      el('online-copy').textContent = copy.copied;
    } catch { el('online-room').select(); fail('copyFailed'); }
  };
  el('online-draw').onclick = () => send('offer_draw');
  el('online-accept').onclick = () => send('accept_draw');
  el('online-decline').onclick = () => send('decline_draw');
  el('online-rematch').onclick = () => send('rematch');
  el('online-resign').onclick = () => {
    if (confirmation !== 'resign') { confirmation = 'resign'; render(); return; }
    send('resign'); confirmation = ''; render();
  };
  el('online-cancel').onclick = () => { confirmation = ''; render(); };
  el('online-leave').onclick = () => {
    if (phase === 'connected' && state?.status === 'playing' && confirmation !== 'leave') { confirmation = 'leave'; render(); return; }
    send('leave'); reset();
  };
  el('online-retry').onclick = () => { retries = 0; void connect(); };
  window.addEventListener('chess:illegal', () => fail('illegal_move'));
  window.addEventListener('message', (event) => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'chess:copy') return;
    copy = event.data.copy;
    for (const node of document.querySelectorAll('[data-online-copy]')) node.textContent = copy[node.dataset.onlineCopy];
    el('online-panel').hidden = false;
    document.querySelector('.online-launch').hidden = false;
    render();
    if (!configured) {
      configured = true;
      try {
        const code = sessionStorage.getItem('atelier-online-room');
        if (code) start({type: 'join', code});
      } catch { /* A fresh online game does not require browser storage. */ }
    }
  });
  if (parent !== window) parent.postMessage({type: 'chess:copy', id: requestId()}, location.origin);
  setInterval(updateClocks, 200);
  setInterval(() => { if (phase === 'connected') send('ping'); }, 10000);
  window.addEventListener('pagehide', stop);
})();
