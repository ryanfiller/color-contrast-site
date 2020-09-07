
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const MATCH_PARAM = RegExp(/\:([^/()]+)/g);

    function handleScroll (element) {
      if (navigator.userAgent.includes('jsdom')) return false
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash () {
      if (navigator.userAgent.includes('jsdom')) return false
      const { hash } = window.location;
      if (hash) {
        const validElementIdRegex = /^[A-Za-z]+[\w\-\:\.]*$/;
        if (validElementIdRegex.test(hash.substring(1))) {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView();
        }
      }
    }

    function scrollAncestorsToTop (element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock' &&
        element.dataset['routify-scroll'] !== 'lock'
      ) {
        element.style['scroll-behavior'] = 'auto';
        element.scrollTo({ top: 0, behavior: 'auto' });
        element.style['scroll-behavior'] = '';
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParamKeys = string => {
      const paramsKeys = [];
      let matches;
      while ((matches = MATCH_PARAM.exec(string))) paramsKeys.push(matches[1]);
      return paramsKeys
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings () {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function (msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    function currentLocation () {
      const pathMatch = window.location.search.match(/__routify_path=([^&]+)/);
      const prefetchMatch = window.location.search.match(/__routify_prefetch=\d+/);
      window.routify = window.routify || {};
      window.routify.prefetched = prefetchMatch ? true : false;
      const path = pathMatch && pathMatch[1].replace(/[#?].+/, ''); // strip any thing after ? and #
      return path || window.location.pathname
    }

    window.routify = window.routify || {};

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const route = writable(null); // the actual route being rendered

    /** @type {import('svelte/store').Writable<RouteNode[]>} */
    const routes = writable([]); // all routes
    routes.subscribe(routes => (window.routify.routes = routes));

    let rootContext = writable({ component: { params: {} } });

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const urlRoute = writable(null);  // the route matching the url

    /** @type {import('svelte/store').Writable<String>} */
    const basepath = (() => {
        const { set, subscribe } = writable("");

        return {
            subscribe,
            set(value) {
                if (value.match(/^[/(]/))
                    set(value);
                else console.warn('Basepaths must start with / or (');
            },
            update() { console.warn('Use assignment or set to update basepaths.'); }
        }
    })();

    const location$1 = derived( // the part of the url matching the basepath
        [basepath, urlRoute],
        ([$basepath, $route]) => {
            const [, base, path] = currentLocation().match(`^(${$basepath})(${$route.regex})`) || [];
            return { base, path }
        }
    );

    const prefetchPath = writable("");

    function onAppLoaded({ path, metatags }) {
        metatags.update();
        const prefetchMatch = window.location.search.match(/__routify_prefetch=(\d+)/);
        const prefetchId = prefetchMatch && prefetchMatch[1];

        dispatchEvent(new CustomEvent('app-loaded'));
        parent.postMessage({
            msg: 'app-loaded',
            prefetched: window.routify.prefetched,
            path,
            prefetchId
        }, "*");
        window['routify'].appLoaded = true;
    }

    var defaultConfig = {
        queryHandler: {
            parse: search => fromEntries(new URLSearchParams(search)),
            stringify: params => '?' + (new URLSearchParams(params)).toString()
        }
    };


    function fromEntries(iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj
        }, {})
    }

    /**
     * @param {string} url 
     * @return {ClientNode}
     */
    function urlToRoute(url) {
        /** @type {RouteNode[]} */
        const routes$1 = get_store_value(routes);
        const basepath$1 = get_store_value(basepath);
        const route = routes$1.find(route => url.match(`^${basepath$1}${route.regex}`));
        if (!route)
            throw new Error(
                `Route could not be found for "${url}".`
            )

        const [, base] = url.match(`^(${basepath$1})${route.regex}`);
        const path = url.slice(base.length);

        if (defaultConfig.queryHandler)
            route.params = defaultConfig.queryHandler.parse(window.location.search);

        if (route.paramKeys) {
            const layouts = layoutByPos(route.layouts);
            const fragments = path.split('/').filter(Boolean);
            const routeProps = getRouteProps(route.path);

            routeProps.forEach((prop, i) => {
                if (prop) {
                    route.params[prop] = fragments[i];
                    if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
                    else route.param = { [prop]: fragments[i] };
                }
            });
        }

        route.leftover = url.replace(new RegExp(base + route.regex), '');

        return route
    }


    /**
     * @param {array} layouts
     */
    function layoutByPos(layouts) {
        const arr = [];
        layouts.forEach(layout => {
            arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
        });
        return arr
    }


    /**
     * @param {string} url
     */
    function getRouteProps(url) {
        return url
            .split('/')
            .filter(Boolean)
            .map(f => f.match(/\:(.+)/))
            .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Prefetcher.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1 } = globals;
    const file = "node_modules/@sveltech/routify/runtime/Prefetcher.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (93:2) {#each $actives as prefetch (prefetch.options.prefetch)}
    function create_each_block(key_1, ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			iframe = element("iframe");
    			if (iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "title", "routify prefetcher");
    			add_location(iframe, file, 93, 4, 2705);
    			this.first = iframe;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$actives*/ 1 && iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(93:2) {#each $actives as prefetch (prefetch.options.prefetch)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$actives*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*prefetch*/ ctx[1].options.prefetch;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "__routify_iframes");
    			set_style(div, "display", "none");
    			add_location(div, file, 91, 0, 2591);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$actives*/ 1) {
    				const each_value = /*$actives*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const iframeNum = 2;

    const defaults = {
    	validFor: 60,
    	timeout: 5000,
    	gracePeriod: 1000
    };

    /** stores and subscriptions */
    const queue = writable([]);

    const actives = derived(queue, q => q.slice(0, iframeNum));

    actives.subscribe(actives => actives.forEach(({ options }) => {
    	setTimeout(() => removeFromQueue(options.prefetch), options.timeout);
    }));

    function prefetch(path, options = {}) {
    	prefetch.id = prefetch.id || 1;

    	path = !path.href
    	? path
    	: path.href.replace(/^(?:\/\/|[^/]+)*\//, "/");

    	//replace first ? since were mixing user queries with routify queries
    	path = path.replace("?", "&");

    	options = { ...defaults, ...options, path };
    	options.prefetch = prefetch.id++;

    	//don't prefetch within prefetch or SSR
    	if (window.routify.prefetched || navigator.userAgent.match("jsdom")) return false;

    	// add to queue
    	queue.update(q => {
    		if (!q.some(e => e.options.path === path)) q.push({
    			url: `/__app.html?${optionsToQuery(options)}`,
    			options
    		});

    		return q;
    	});
    }

    /**
     * convert options to query string
     * {a:1,b:2} becomes __routify_a=1&routify_b=2
     * @param {defaults & {path: string, prefetch: number}} options
     */
    function optionsToQuery(options) {
    	return Object.entries(options).map(([key, val]) => `__routify_${key}=${val}`).join("&");
    }

    /**
     * @param {number|MessageEvent} idOrEvent
     */
    function removeFromQueue(idOrEvent) {
    	const id = idOrEvent.data ? idOrEvent.data.prefetchId : idOrEvent;
    	if (!id) return null;
    	const entry = get_store_value(queue).find(entry => entry && entry.options.prefetch == id);

    	// removeFromQueue is called by both eventListener and timeout,
    	// but we can only remove the item once
    	if (entry) {
    		const { gracePeriod } = entry.options;
    		const gracePromise = new Promise(resolve => setTimeout(resolve, gracePeriod));

    		const idlePromise = new Promise(resolve => {
    				window.requestIdleCallback
    				? window.requestIdleCallback(resolve)
    				: setTimeout(resolve, gracePeriod + 1000);
    			});

    		Promise.all([gracePromise, idlePromise]).then(() => {
    			queue.update(q => q.filter(q => q.options.prefetch != id));
    		});
    	}
    }

    // Listen to message from child window
    addEventListener("message", removeFromQueue, false);

    function instance($$self, $$props, $$invalidate) {
    	let $actives;
    	validate_store(actives, "actives");
    	component_subscribe($$self, actives, $$value => $$invalidate(0, $actives = $$value));
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prefetcher> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Prefetcher", $$slots, []);

    	$$self.$capture_state = () => ({
    		writable,
    		derived,
    		get: get_store_value,
    		iframeNum,
    		defaults,
    		queue,
    		actives,
    		prefetch,
    		optionsToQuery,
    		removeFromQueue,
    		$actives
    	});

    	return [$actives];
    }

    class Prefetcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefetcher",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /// <reference path="../typedef.js" />

    /** @ts-check */
    /**
     * @typedef {Object} RoutifyContext
     * @prop {ClientNode} component
     * @prop {ClientNode} layout
     * @prop {any} componentFile 
     * 
     *  @returns {import('svelte/store').Readable<RoutifyContext>} */
    function getRoutifyContext() {
      return getContext('routify') || rootContext
    }

    /**
     * @callback AfterPageLoadHelper
     * @param {function} callback
     * 
     * @typedef {import('svelte/store').Readable<AfterPageLoadHelper> & {_hooks:Array<function>}} AfterPageLoadHelperStore
     * @type {AfterPageLoadHelperStore}
     */
    const afterPageLoad = {
      _hooks: [],
      subscribe: hookHandler
    };

    /** 
     * @callback BeforeUrlChangeHelper
     * @param {function} callback
     *
     * @typedef {import('svelte/store').Readable<BeforeUrlChangeHelper> & {_hooks:Array<function>}} BeforeUrlChangeHelperStore
     * @type {BeforeUrlChangeHelperStore}
     **/
    const beforeUrlChange = {
      _hooks: [],
      subscribe: hookHandler
    };

    function hookHandler(listener) {
      const hooks = this._hooks;
      const index = hooks.length;
      listener(callback => { hooks[index] = callback; });
      return () => delete hooks[index]
    }

    /**
     * We have to grab params and leftover from the context and not directly from the store.
     * Otherwise the context is updated before the component is destroyed. * 
     * @typedef {Object.<string, *>} ParamsHelper
     * @typedef {import('svelte/store').Readable<ParamsHelper>} ParamsHelperStore
     * @type {ParamsHelperStore}
     **/
    const params = {
      subscribe(run) {
        const ctx = getRoutifyContext();
        return derived(ctx, ctx => ctx.route.params).subscribe(run)
      }
    };

    /**
     * @callback UrlHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @return {String}
     *
     * @typedef {import('svelte/store').Readable<UrlHelper>} UrlHelperStore
     * @type {UrlHelperStore} 
     * */
    const url = {
      subscribe(listener) {
        const ctx = getRoutifyContext();
        return derived(
          [ctx, route, routes, location$1],
          args => makeUrlHelper(...args)
        ).subscribe(
          listener
        )
      }
    };

    /** 
     * @param {{component: ClientNode}} $ctx 
     * @param {RouteNode} $oldRoute 
     * @param {RouteNode[]} $routes 
     * @param {{base: string, path: string}} $location
     * @returns {UrlHelper}
     */
    function makeUrlHelper($ctx, $oldRoute, $routes, $location) {
      return function url(path, params, options) {
        const { component } = $ctx;
        path = path || './';

        const strict = options && options.strict !== false;
        if (!strict) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          let [, breadcrumbs, relativePath] = path.match(/^([\.\/]+)(.*)/);
          let dir = component.path.replace(/\/$/, '');
          const traverse = breadcrumbs.match(/\.\.\//g) || [];
          traverse.forEach(() => dir = dir.replace(/\/[^\/]+\/?$/, ''));
          path = `${dir}/${relativePath}`.replace(/\/$/, '');

        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = $routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        /** @type {Object<string, *>} Parameters */
        const allParams = Object.assign({}, $oldRoute.params, component.params, params);
        let pathWithParams = path;
        for (const [key, value] of Object.entries(allParams)) {
          pathWithParams = pathWithParams.replace(`:${key}`, value);
        }

        const fullPath = $location.base + pathWithParams + _getQueryString(path, params);
        return fullPath.replace(/\?$/, '')
      }
    }

    /**
     * 
     * @param {string} path 
     * @param {object} params 
     */
    function _getQueryString(path, params) {
      if (!defaultConfig.queryHandler) return ""
      const pathParamKeys = pathToParamKeys(path);
      const queryParams = {};
      if (params) Object.entries(params).forEach(([key, value]) => {
        if (!pathParamKeys.includes(key))
          queryParams[key] = value;
      });
      return defaultConfig.queryHandler.stringify(queryParams)
    }



    const _metatags = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _metatags.getLongest(_metatags.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _metatags.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _metatags.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = metatags.services[serviceName] || metatags.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _metatags.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _metatags.getOrigin();
        _metatags.templates[name] = _metatags.templates[name] || {};
        _metatags.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_metatags.props).forEach((prop) => {
          let value = (_metatags.getLongest(_metatags.props, prop));
          _metatags.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_metatags._pendingUpdate) {
          _metatags._pendingUpdate = true;
          setTimeout(() => {
            _metatags._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getRoutifyContext();
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };


    /**
     * metatags
     * @prop {Object.<string, string>}
     */
    const metatags = new Proxy(_metatags, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }

        if (window['routify'].appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    const isChangingPage = (function () {
      const store = writable(false);
      beforeUrlChange.subscribe(fn => fn(event => {
        store.set(true);
        return true
      }));
      
      afterPageLoad.subscribe(fn => fn(event => store.set(false)));

      return store
    })();

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.24.1 */
    const file$1 = "node_modules/@sveltech/routify/runtime/Route.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    // (120:0) {#if $context}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$context*/ ctx[6].component.isLayout === false) return 0;
    		if (/*remainingLayouts*/ ctx[5].length) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(120:0) {#if $context}",
    		ctx
    	});

    	return block;
    }

    // (132:36) 
    function create_if_block_3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout, remainingLayouts, decorator, Decorator, scopeToChild*/ 100663415) {
    				const each_value_1 = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(132:36) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $context.component.isLayout === false}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout*/ 85) {
    				const each_value = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(121:2) {#if $context.component.isLayout === false}",
    		ctx
    	});

    	return block;
    }

    // (134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>
    function create_default_slot(ctx) {
    	let route_1;
    	let t;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[5]],
    				Decorator: typeof /*decorator*/ ctx[26] !== "undefined"
    				? /*decorator*/ ctx[26]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*layout*/ ctx[4].isDecorator,
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[25]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 32) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[5]];

    			if (dirty & /*decorator, Decorator*/ 67108866) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== "undefined"
    			? /*decorator*/ ctx[26]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*layout*/ 16) route_1_changes.childOfDecorator = /*layout*/ ctx[4].isDecorator;

    			if (dirty & /*scoped, scopeToChild*/ 33554433) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[25]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>",
    		ctx
    	});

    	return block;
    }

    // (133:4) {#each [$context] as { component, componentFile }
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 25: scopeToChild, 26: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 33554432 : 0) | (decorator ? 67108864 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, layout, scoped, scopeToChild*/ 234881075) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(133:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#each [$context] as { component, componentFile }
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(122:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (152:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$1, 152, 2, 4450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(setParent_action = /*setParent*/ ctx[8].call(null, span));
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(152:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$context*/ ctx[6] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$context*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$context*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[3]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $route;
    	let $context;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(14, $route = $$value));
    	let { layouts = [] } = $$props;
    	let { scoped = {} } = $$props;
    	let { Decorator = null } = $$props;
    	let { childOfDecorator = false } = $$props;
    	let { isRoot = false } = $$props;
    	let scopedSync = {};
    	let isDecorator = false;

    	/** @type {HTMLElement} */
    	let parentElement;

    	/** @type {LayoutOrDecorator} */
    	let layout = null;

    	/** @type {LayoutOrDecorator} */
    	let lastLayout = null;

    	/** @type {LayoutOrDecorator[]} */
    	let remainingLayouts = [];

    	const context = writable(null);
    	validate_store(context, "context");
    	component_subscribe($$self, context, value => $$invalidate(6, $context = value));

    	/** @type {import("svelte/store").Writable<Context>} */
    	const parentContextStore = getContext("routify");

    	isDecorator = Decorator && !childOfDecorator;
    	setContext("routify", context);

    	/** @param {HTMLElement} el */
    	function setParent(el) {
    		$$invalidate(3, parentElement = el.parentElement);
    	}

    	/** @param {SvelteComponent} componentFile */
    	function onComponentLoaded(componentFile) {
    		/** @type {Context} */
    		const parentContext = get_store_value(parentContextStore);

    		$$invalidate(2, scopedSync = { ...scoped });
    		lastLayout = layout;
    		if (remainingLayouts.length === 0) onLastComponentLoaded();

    		const ctx = {
    			layout: isDecorator ? parentContext.layout : layout,
    			component: layout,
    			route: $route,
    			componentFile,
    			child: isDecorator
    			? parentContext.child
    			: get_store_value(context) && get_store_value(context).child
    		};

    		context.set(ctx);
    		if (isRoot) rootContext.set(ctx);

    		if (parentContext && !isDecorator) parentContextStore.update(store => {
    			store.child = layout || store.child;
    			return store;
    		});
    	}

    	/**  @param {LayoutOrDecorator} layout */
    	function setComponent(layout) {
    		let PendingComponent = layout.component();
    		if (PendingComponent instanceof Promise) PendingComponent.then(onComponentLoaded); else onComponentLoaded(PendingComponent);
    	}

    	async function onLastComponentLoaded() {
    		afterPageLoad._hooks.forEach(hook => hook(layout.api));
    		await tick();
    		handleScroll(parentElement);

    		if (!window["routify"].appLoaded) {
    			const pagePath = $context.component.path;
    			const routePath = $route.path;
    			const isOnCurrentRoute = pagePath === routePath; //maybe we're getting redirected

    			// Let everyone know the last child has rendered
    			if (!window["routify"].stopAutoReady && isOnCurrentRoute) {
    				onAppLoaded({ path: pagePath, metatags });
    			}
    		}
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "childOfDecorator", "isRoot"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		get: get_store_value,
    		metatags,
    		afterPageLoad,
    		route,
    		routes,
    		rootContext,
    		handleScroll,
    		onAppLoaded,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		isRoot,
    		scopedSync,
    		isDecorator,
    		parentElement,
    		layout,
    		lastLayout,
    		remainingLayouts,
    		context,
    		parentContextStore,
    		setParent,
    		onComponentLoaded,
    		setComponent,
    		onLastComponentLoaded,
    		$route,
    		$context
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    		if ("scopedSync" in $$props) $$invalidate(2, scopedSync = $$props.scopedSync);
    		if ("isDecorator" in $$props) $$invalidate(12, isDecorator = $$props.isDecorator);
    		if ("parentElement" in $$props) $$invalidate(3, parentElement = $$props.parentElement);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("lastLayout" in $$props) lastLayout = $$props.lastLayout;
    		if ("remainingLayouts" in $$props) $$invalidate(5, remainingLayouts = $$props.remainingLayouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isDecorator, Decorator, layouts*/ 4610) {
    			 if (isDecorator) {
    				const decoratorLayout = {
    					component: () => Decorator,
    					path: `${layouts[0].path}__decorator`,
    					isDecorator: true
    				};

    				$$invalidate(9, layouts = [decoratorLayout, ...layouts]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 512) {
    			 $$invalidate(4, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(5, remainingLayouts), $$invalidate(9, layouts)), $$invalidate(12, isDecorator)), $$invalidate(1, Decorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 16) {
    			 setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		scopedSync,
    		parentElement,
    		layout,
    		remainingLayouts,
    		$context,
    		context,
    		setParent,
    		layouts,
    		childOfDecorator,
    		isRoot
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			layouts: 9,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 10,
    			isRoot: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRoot() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRoot(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function init$1(routes, callback) {
      /** @type { ClientNode | false } */
      let lastRoute = false;

      function updatePage(proxyToUrl, shallow) {
        const url = proxyToUrl || currentLocation();
        const route$1 = urlToRoute(url);
        const currentRoute = shallow && urlToRoute(currentLocation());
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        if (lastRoute) delete lastRoute.last; //todo is a page component the right place for the previous route?
        route$1.last = lastRoute;
        lastRoute = route$1;

        //set the route in the store
        if (!proxyToUrl)
          urlRoute.set(route$1);
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state = {}, title, url) {
          const { id, path, params } = get_store_value(route);
          state = { id, path, params, ...state };
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of beforeUrlChange._hooks.filter(Boolean)) {
        // return false if the hook returns false
        const result = await hook(event, route$1); //todo remove route from hook. Its API Can be accessed as $page
        if (!result) return false
      }
      return true
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1$1 } = globals;

    // (64:0) {#if layouts && $route !== null}
    function create_if_block$1(ctx) {
    	let route_1;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: /*layouts*/ ctx[0],
    				isRoot: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*layouts*/ 1) route_1_changes.layouts = /*layouts*/ ctx[0];
    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(64:0) {#if layouts && $route !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let prefetcher;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null && create_if_block$1(ctx);
    	prefetcher = new Prefetcher({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(prefetcher.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(prefetcher, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*layouts, $route*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(prefetcher.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(prefetcher.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(prefetcher, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { routes: routes$1 } = $$props;
    	let { config = {} } = $$props;
    	let layouts;
    	let navigator;
    	window.routify = window.routify || {};
    	window.routify.inBrowser = !window.navigator.userAgent.match("jsdom");

    	Object.entries(config).forEach(([key, value]) => {
    		defaultConfig[key] = value;
    	});

    	suppressWarnings();
    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext("routifyupdatepage", updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	let initTimeout = null;

    	// init is async to prevent a horrible bug that completely disable reactivity
    	// in the host component -- something like the component's update function is
    	// called before its fragment is created, and since the component is then seen
    	// as already dirty, it is never scheduled for update again, and remains dirty
    	// forever... I failed to isolate the precise conditions for the bug, but the
    	// faulty update is triggered by a change in the route store, and so offseting
    	// store initialization by one tick gives the host component some time to
    	// create its fragment. The root cause it probably a bug in Svelte with deeply
    	// intertwinned store and reactivity.
    	const doInit = () => {
    		clearTimeout(initTimeout);

    		initTimeout = setTimeout(() => {
    			cleanup();
    			navigator = init$1(routes$1, callback);
    			routes.set(routes$1);
    			navigator.updatePage();
    		});
    	};

    	onDestroy(cleanup);
    	const writable_props = ["routes", "config"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		Prefetcher,
    		init: init$1,
    		route,
    		routesStore: routes,
    		prefetchPath,
    		suppressWarnings,
    		defaultConfig,
    		routes: routes$1,
    		config,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		initTimeout,
    		doInit,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("navigator" in $$props) navigator = $$props.navigator;
    		if ("initTimeout" in $$props) initTimeout = $$props.initTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 4) {
    			 if (routes$1) doInit();
    		}
    	};

    	return [layouts, $route, routes$1, config];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { routes: 2, config: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[2] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /** 
     * Node payload
     * @typedef {Object} NodePayload
     * @property {RouteNode=} file current node
     * @property {RouteNode=} parent parent of the current node
     * @property {StateObject=} state state shared by every node in the walker
     * @property {Object=} scope scope inherited by descendants in the scope
     *
     * State Object
     * @typedef {Object} StateObject
     * @prop {TreePayload=} treePayload payload from the tree
     * 
     * Node walker proxy
     * @callback NodeWalkerProxy
     * @param {NodePayload} NodePayload
     */


    /**
     * Node middleware
     * @description Walks through the nodes of a tree
     * @example middleware = createNodeMiddleware(payload => {payload.file.name = 'hello'})(treePayload))
     * @param {NodeWalkerProxy} fn 
     */
    function createNodeMiddleware(fn) {

        /**    
         * NodeMiddleware payload receiver
         * @param {TreePayload} payload
         */
        const inner = async function execute(payload) {
            return await nodeMiddleware(payload.tree, fn, { state: { treePayload: payload } })
        };

        /**    
         * NodeMiddleware sync payload receiver
         * @param {TreePayload} payload
         */
        inner.sync = function executeSync(payload) {
            return nodeMiddlewareSync(payload.tree, fn, { state: { treePayload: payload } })
        };

        return inner
    }

    /**
     * Node walker
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    async function nodeMiddleware(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        await fn(payload);

        if (file.children) {
            payload.parent = file;
            await Promise.all(file.children.map(_file => nodeMiddleware(_file, fn, payload)));
        }
        return payload
    }

    /**
     * Node walker (sync version)
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    function nodeMiddlewareSync(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        fn(payload);

        if (file.children) {
            payload.parent = file;
            file.children.map(_file => nodeMiddlewareSync(_file, fn, payload));
        }
        return payload
    }


    /**
     * Clone with JSON
     * @param {T} obj 
     * @returns {T} JSON cloned object
     * @template T
     */
    function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

    const setRegex = createNodeMiddleware(({ file }) => {
        if (file.isPage || file.isFallback)
            file.regex = pathToRegex(file.path, file.isFallback);
    });
    const setParamKeys = createNodeMiddleware(({ file }) => {
        file.paramKeys = pathToParamKeys(file.path);
    });

    const setShortPath = createNodeMiddleware(({ file }) => {
        if (file.isFallback || file.isIndex)
            file.shortPath = file.path.replace(/\/[^/]+$/, '');
        else file.shortPath = file.path;
    });
    const setRank = createNodeMiddleware(({ file }) => {
        file.ranking = pathToRank(file);
    });


    // todo delete?
    const addMetaChildren = createNodeMiddleware(({ file }) => {
        const node = file;
        const metaChildren = file.meta && file.meta.children || [];
        if (metaChildren.length) {
            node.children = node.children || [];
            node.children.push(...metaChildren.map(meta => ({ isMeta: true, ...meta, meta })));
        }
    });

    const setIsIndexable = createNodeMiddleware(payload => {
        const { file } = payload;
        const { isLayout, isFallback, meta } = file;
        file.isIndexable = !isLayout && !isFallback && meta.index !== false;
        file.isNonIndexable = !file.isIndexable;
    });


    const assignRelations = createNodeMiddleware(({ file, parent }) => {
        Object.defineProperty(file, 'parent', { get: () => parent });
        Object.defineProperty(file, 'nextSibling', { get: () => _getSibling(file, 1) });
        Object.defineProperty(file, 'prevSibling', { get: () => _getSibling(file, -1) });
        Object.defineProperty(file, 'lineage', { get: () => _getLineage(parent) });
    });

    function _getLineage(node, lineage = []){
        if(node){
            lineage.unshift(node);
            _getLineage(node.parent, lineage);
        }
        return lineage
    }

    /**
     * 
     * @param {RouteNode} file 
     * @param {Number} direction 
     */
    function _getSibling(file, direction) {
        if (!file.root) {
            const siblings = file.parent.children.filter(c => c.isIndexable);
            const index = siblings.indexOf(file);
            return siblings[index + direction]
        }
    }

    const assignIndex = createNodeMiddleware(({ file, parent }) => {
        if (file.isIndex) Object.defineProperty(parent, 'index', { get: () => file });
        if (file.isLayout)
            Object.defineProperty(parent, 'layout', { get: () => file });
    });

    const assignLayout = createNodeMiddleware(({ file, scope }) => {
        Object.defineProperty(file, 'layouts', { get: () => getLayouts(file) });
        function getLayouts(file) {
            const { parent } = file;
            const layout = parent && parent.layout;
            const isReset = layout && layout.isReset;
            const layouts = (parent && !isReset && getLayouts(parent)) || [];
            if (layout) layouts.push(layout);
            return layouts
        }
    });


    const createFlatList = treePayload => {
        createNodeMiddleware(payload => {
            if (payload.file.isPage || payload.file.isFallback)
            payload.state.treePayload.routes.push(payload.file);
        }).sync(treePayload);    
        treePayload.routes.sort((c, p) => (c.ranking >= p.ranking ? -1 : 1));
    };

    const setPrototype = createNodeMiddleware(({ file }) => {
        const Prototype = file.root
            ? Root
            : file.children
                ? file.isFile ? PageDir : Dir
                : file.isReset
                    ? Reset
                    : file.isLayout
                        ? Layout
                        : file.isFallback
                            ? Fallback
                            : Page;
        Object.setPrototypeOf(file, Prototype.prototype);

        function Layout() { }
        function Dir() { }
        function Fallback() { }
        function Page() { }
        function PageDir() { }
        function Reset() { }
        function Root() { }
    });

    var miscPlugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setRegex: setRegex,
        setParamKeys: setParamKeys,
        setShortPath: setShortPath,
        setRank: setRank,
        addMetaChildren: addMetaChildren,
        setIsIndexable: setIsIndexable,
        assignRelations: assignRelations,
        assignIndex: assignIndex,
        assignLayout: assignLayout,
        createFlatList: createFlatList,
        setPrototype: setPrototype
    });

    const assignAPI = createNodeMiddleware(({ file }) => {
        file.api = new ClientApi(file);
    });

    class ClientApi {
        constructor(file) {
            this.__file = file;
            Object.defineProperty(this, '__file', { enumerable: false });
            this.isMeta = !!file.isMeta;
            this.path = file.path;
            this.title = _prettyName(file);
            this.meta = file.meta;
        }

        get parent() { return !this.__file.root && this.__file.parent.api }
        get children() {
            return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
                .filter(c => !c.isNonIndexable)
                .sort((a, b) => {
                    if(a.isMeta && b.isMeta) return 0
                    a = (a.meta.index || a.meta.title || a.path).toString();
                    b = (b.meta.index || b.meta.title || b.path).toString();
                    return a.localeCompare((b), undefined, { numeric: true, sensitivity: 'base' })
                })
                .map(({ api }) => api)
        }
        get next() { return _navigate(this, +1) }
        get prev() { return _navigate(this, -1) }
        preload() {
            this.__file.layouts.forEach(file => file.component());
            this.__file.component(); 
        }
    }

    function _navigate(node, direction) {
        if (!node.__file.root) {
            const siblings = node.parent.children;
            const index = siblings.indexOf(node);
            return node.parent.children[index + direction]
        }
    }


    function _prettyName(file) {
        if (typeof file.meta.title !== 'undefined') return file.meta.title
        else return (file.shortPath || file.path)
            .split('/')
            .pop()
            .replace(/-/g, ' ')
    }

    const plugins = {...miscPlugins, assignAPI};

    function buildClientTree(tree) {
      const order = [
        // pages
        "setParamKeys", //pages only
        "setRegex", //pages only
        "setShortPath", //pages only
        "setRank", //pages only
        "assignLayout", //pages only,
        // all
        "setPrototype",
        "addMetaChildren",
        "assignRelations", //all (except meta components?)
        "setIsIndexable", //all
        "assignIndex", //all
        "assignAPI", //all
        // routes
        "createFlatList"
      ];

      const payload = { tree, routes: [] };
      for (let name of order) {
        const syncFn = plugins[name].sync || plugins[name];
        syncFn(payload);
      }
      return payload
    }

    /* src/components/breadcrumbs.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/components/breadcrumbs.svelte";

    // (46:3) {#if owner}
    function create_if_block_1$1(ctx) {
    	let li;
    	let a;
    	let t_value = /*owner*/ ctx[0].name + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2](`/${/*owner*/ ctx[0].slug}`));
    			add_location(a, file$2, 47, 5, 603);
    			attr_dev(li, "class", "svelte-1ny92nz");
    			add_location(li, file$2, 46, 4, 593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*owner*/ 1 && t_value !== (t_value = /*owner*/ ctx[0].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*$url, owner*/ 5 && a_href_value !== (a_href_value = /*$url*/ ctx[2](`/${/*owner*/ ctx[0].slug}`))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(46:3) {#if owner}",
    		ctx
    	});

    	return block;
    }

    // (51:3) {#if palette}
    function create_if_block$2(ctx) {
    	let li;
    	let a;
    	let t_value = /*palette*/ ctx[1].title + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2](`/${/*owner*/ ctx[0].slug}/${/*palette*/ ctx[1].slug}`));
    			add_location(a, file$2, 52, 5, 703);
    			attr_dev(li, "class", "svelte-1ny92nz");
    			add_location(li, file$2, 51, 4, 693);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*palette*/ 2 && t_value !== (t_value = /*palette*/ ctx[1].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*$url, owner, palette*/ 7 && a_href_value !== (a_href_value = /*$url*/ ctx[2](`/${/*owner*/ ctx[0].slug}/${/*palette*/ ctx[1].slug}`))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(51:3) {#if palette}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let nav;
    	let ul;
    	let li;
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let t2;
    	let if_block0 = /*owner*/ ctx[0] && create_if_block_1$1(ctx);
    	let if_block1 = /*palette*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li = element("li");
    			a = element("a");
    			t0 = text("home");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2]("/"));
    			add_location(a, file$2, 43, 3, 537);
    			attr_dev(li, "class", "svelte-1ny92nz");
    			add_location(li, file$2, 42, 2, 529);
    			attr_dev(ul, "class", "svelte-1ny92nz");
    			add_location(ul, file$2, 41, 1, 522);
    			attr_dev(nav, "class", "svelte-1ny92nz");
    			add_location(nav, file$2, 40, 0, 515);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(ul, t1);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t2);
    			if (if_block1) if_block1.m(ul, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 4 && a_href_value !== (a_href_value = /*$url*/ ctx[2]("/"))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*owner*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(ul, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*palette*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	let { owner } = $$props;
    	let { palette } = $$props;
    	const writable_props = ["owner", "palette"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Breadcrumbs> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Breadcrumbs", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("owner" in $$props) $$invalidate(0, owner = $$props.owner);
    		if ("palette" in $$props) $$invalidate(1, palette = $$props.palette);
    	};

    	$$self.$capture_state = () => ({ url, owner, palette, $url });

    	$$self.$inject_state = $$props => {
    		if ("owner" in $$props) $$invalidate(0, owner = $$props.owner);
    		if ("palette" in $$props) $$invalidate(1, palette = $$props.palette);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [owner, palette, $url];
    }

    class Breadcrumbs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { owner: 0, palette: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Breadcrumbs",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*owner*/ ctx[0] === undefined && !("owner" in props)) {
    			console.warn("<Breadcrumbs> was created without expected prop 'owner'");
    		}

    		if (/*palette*/ ctx[1] === undefined && !("palette" in props)) {
    			console.warn("<Breadcrumbs> was created without expected prop 'palette'");
    		}
    	}

    	get owner() {
    		throw new Error("<Breadcrumbs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set owner(value) {
    		throw new Error("<Breadcrumbs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get palette() {
    		throw new Error("<Breadcrumbs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set palette(value) {
    		throw new Error("<Breadcrumbs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const actions = writable([]);
    const activeAction = writable('');
    const colorPalette = writable([]);
    const currentData = writable({});

    /* src/components/button.svelte generated by Svelte v3.24.1 */

    const file$3 = "src/components/button.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "title", /*title*/ ctx[0]);
    			attr_dev(button, "class", "svelte-1wuu40l");
    			toggle_class(button, "active", /*active*/ ctx[2]);
    			add_location(button, file$3, 35, 0, 638);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*action*/ ctx[1])) /*action*/ ctx[1].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*title*/ 1) {
    				attr_dev(button, "title", /*title*/ ctx[0]);
    			}

    			if (dirty & /*active*/ 4) {
    				toggle_class(button, "active", /*active*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { title = "" } = $$props;

    	let { action = () => {
    		
    	} } = $$props;

    	let { active = false } = $$props;
    	const writable_props = ["title", "action", "active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("action" in $$props) $$invalidate(1, action = $$props.action);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, action, active });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("action" in $$props) $$invalidate(1, action = $$props.action);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, action, active, $$scope, $$slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { title: 0, action: 1, active: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get title() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* static/icons/sun.svg generated by Svelte v3.24.1 */

    function create_fragment$5(ctx) {
    	let svg;
    	let g;
    	let path;
    	let polygon0;
    	let polygon1;
    	let polygon2;
    	let polygon3;
    	let polygon4;
    	let polygon5;
    	let polygon6;
    	let polygon7;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			polygon0 = svg_element("polygon");
    			polygon1 = svg_element("polygon");
    			polygon2 = svg_element("polygon");
    			polygon3 = svg_element("polygon");
    			polygon4 = svg_element("polygon");
    			polygon5 = svg_element("polygon");
    			polygon6 = svg_element("polygon");
    			polygon7 = svg_element("polygon");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			g = claim_element(svg_nodes, "g", {}, 1);
    			var g_nodes = children(g);
    			path = claim_element(g_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			polygon0 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon0).forEach(detach);
    			polygon1 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon1).forEach(detach);
    			polygon2 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon2).forEach(detach);
    			polygon3 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon3).forEach(detach);
    			polygon4 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon4).forEach(detach);
    			polygon5 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon5).forEach(detach);
    			polygon6 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon6).forEach(detach);
    			polygon7 = claim_element(g_nodes, "polygon", { points: true }, 1);
    			children(polygon7).forEach(detach);
    			g_nodes.forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M237.82,150A87.82,87.82,0,1,1,150,62.18,87.82,87.82,0,0,1,237.82,150");
    			attr(polygon0, "points", "126.05 253.36 173.95 253.36 150 300 126.05 253.36");
    			attr(polygon1, "points", "173.95 46.64 126.05 46.64 150 0 173.95 46.64");
    			attr(polygon2, "points", "59.66 206.3 93.7 240.34 44.12 255.88 59.66 206.3");
    			attr(polygon3, "points", "240.34 93.7 206.3 59.66 255.88 44.12 240.34 93.7");
    			attr(polygon4, "points", "46.64 126.05 46.64 173.95 0 150 46.64 126.05");
    			attr(polygon5, "points", "253.36 173.95 253.36 126.05 300 150 253.36 173.95");
    			attr(polygon6, "points", "93.7 59.66 59.66 93.7 44.12 44.12 93.7 59.66");
    			attr(polygon7, "points", "206.3 240.34 240.34 206.3 255.88 255.88 206.3 240.34");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g);
    			append(g, path);
    			append(g, polygon0);
    			append(g, polygon1);
    			append(g, polygon2);
    			append(g, polygon3);
    			append(g, polygon4);
    			append(g, polygon5);
    			append(g, polygon6);
    			append(g, polygon7);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Sun extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* static/icons/moon.svg generated by Svelte v3.24.1 */

    function create_fragment$6(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M300.13,149.81c0,82.4-67.38,149.46-150.11,149.46C71,299.27,5.25,237.89-.1,159.5a9.71,9.71,0,0,1,6-9.67,10.24,10.24,0,0,1,11.34,2C36.92,171.51,61,182.2,85,182.2a96.45,96.45,0,0,0,96.4-96.4c0-24.36-10.67-48.37-30.36-68a9.73,9.73,0,0,1-2-11,10.76,10.76,0,0,1,9.67-6c79.41,4.32,141.46,70,141.46,149.09Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Moon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
    	}
    }

    /* src/components/dark-mode.svelte generated by Svelte v3.24.1 */

    // (44:0) <Button   title='toggle dark mode'   action={toggleDarkMode} >
    function create_default_slot$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = !!/*darkMode*/ ctx[0] ? Moon : Sun;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = !!/*darkMode*/ ctx[0] ? Moon : Sun)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(44:0) <Button   title='toggle dark mode'   action={toggleDarkMode} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				title: "toggle dark mode",
    				action: /*toggleDarkMode*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope, darkMode*/ 65) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const dark = "#212121";
    const light = "#efefef";

    function instance$7($$self, $$props, $$invalidate) {
    	let localStorage;
    	let darkMode;
    	let root;

    	const checkDarkMode = () => {
    		return localStorage && localStorage.getItem("darkMode") === "true"
    		? true
    		: false;
    	};

    	const toggleDarkMode = () => {
    		localStorage && localStorage.setItem("darkMode", !darkMode);
    		$$invalidate(0, darkMode = checkDarkMode());
    	};

    	const setDarkModeCSS = darkMode => {
    		if (!!darkMode) {
    			root.style.setProperty("--textColor", light);
    			root.style.setProperty("--backgroundColor", dark);
    		} else {
    			root.style.setProperty("--textColor", dark);
    			root.style.setProperty("--backgroundColor", light);
    		}
    	};

    	beforeUpdate(() => {
    		localStorage = window.localStorage;
    		$$invalidate(0, darkMode = checkDarkMode());
    		$$invalidate(3, root = document.documentElement);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dark_mode> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dark_mode", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		beforeUpdate,
    		Button,
    		Sun,
    		Moon,
    		localStorage,
    		darkMode,
    		root,
    		dark,
    		light,
    		checkDarkMode,
    		toggleDarkMode,
    		setDarkModeCSS
    	});

    	$$self.$inject_state = $$props => {
    		if ("localStorage" in $$props) localStorage = $$props.localStorage;
    		if ("darkMode" in $$props) $$invalidate(0, darkMode = $$props.darkMode);
    		if ("root" in $$props) $$invalidate(3, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*root, darkMode*/ 9) {
    			 root && setDarkModeCSS(darkMode);
    		}
    	};

    	 checkDarkMode();
    	return [darkMode, toggleDarkMode];
    }

    class Dark_mode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dark_mode",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* static/icons/add.svg generated by Svelte v3.24.1 */

    function create_fragment$8(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M150,0a19.74,19.74,0,0,0-19.74,19.74V130.26H19.74a19.74,19.74,0,0,0,0,39.48H130.26V280.26a19.74,19.74,0,0,0,39.48,0V169.74H280.26a19.74,19.74,0,0,0,0-39.48H169.74V19.74A19.74,19.74,0,0,0,150,0Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Add extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});
    	}
    }

    /* static/icons/code.svg generated by Svelte v3.24.1 */

    function create_fragment$9(ctx) {
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let path2;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			g = claim_element(svg_nodes, "g", {}, 1);
    			var g_nodes = children(g);
    			path0 = claim_element(g_nodes, "path", { d: true }, 1);
    			children(path0).forEach(detach);
    			path1 = claim_element(g_nodes, "path", { d: true }, 1);
    			children(path1).forEach(detach);
    			path2 = claim_element(g_nodes, "path", { d: true }, 1);
    			children(path2).forEach(detach);
    			g_nodes.forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path0, "d", "M295.63,139.77,235.7,79.84A15,15,0,0,0,214.53,101l49.31,49.31-49.37,49.37a15,15,0,0,0,0,21.18c4.6,4.6,16,5.19,21.17,0l59.93-59.93a14.94,14.94,0,0,0,.06-21.18Z");
    			attr(path1, "d", "M85.88,79.81a15,15,0,0,0-21.17,0l-60,59.93a15,15,0,0,0,0,21.17l59.93,60c5.19,5.19,16.58,4.6,21.18,0a15,15,0,0,0,0-21.18L36.52,150.41,85.89,101a15.05,15.05,0,0,0,0-21.23Z");
    			attr(path2, "d", "M192.11,15.93a14.91,14.91,0,0,0-18.75,9.85L98.45,265.49c-2.48,7.9,1.83,16.57,9.85,18.76,8.55,2.3,16.75-3.43,18.75-9.85L202,34.69A15,15,0,0,0,192.11,15.93Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g);
    			append(g, path0);
    			append(g, path1);
    			append(g, path2);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Code extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
    	}
    }

    /* static/icons/download.svg generated by Svelte v3.24.1 */

    function create_fragment$a(ctx) {
    	let svg;
    	let g;
    	let path0;
    	let path1;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			g = claim_element(svg_nodes, "g", {}, 1);
    			var g_nodes = children(g);
    			path0 = claim_element(g_nodes, "path", { d: true }, 1);
    			children(path0).forEach(detach);
    			path1 = claim_element(g_nodes, "path", { d: true }, 1);
    			children(path1).forEach(detach);
    			g_nodes.forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path0, "d", "M58.23,126.88A11,11,0,0,0,60,138.6L141.84,231a11.27,11.27,0,0,0,16.32,0L240,138.6a10.91,10.91,0,0,0-8.16-18.15H182.73V21.91A10.9,10.9,0,0,0,171.82,11H128.18a10.9,10.9,0,0,0-10.91,10.91v98.54H68.18a10.92,10.92,0,0,0-10,6.43Z");
    			attr(path1, "d", "M0,272.64A16.37,16.37,0,0,0,16.36,289H283.64a16.36,16.36,0,0,0,0-32.72H16.36A16.37,16.37,0,0,0,0,272.64Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, g);
    			append(g, path0);
    			append(g, path1);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Download extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});
    	}
    }

    /* static/icons/edit.svg generated by Svelte v3.24.1 */

    function create_fragment$b(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M247.63,101.62,198.51,52.5l27.88-27.88c5.42.61,17,3.68,31,17.7,14.25,14.24,17.43,26,18.09,31.44ZM28.06,272.09l12.43-61.56.94-.94,49.12,49.12-.94.94Zm79.75-30.64L58.68,192.33,181.25,69.76l49.12,49.12ZM274.63,25.08c-21.75-21.75-41-25-50.57-25a27.52,27.52,0,0,0-4.9.37,12.1,12.1,0,0,0-6.49,3.39l-40,40s0,0,0,0L32.81,183.69h0L20.62,195.88a12.11,12.11,0,0,0-3.33,6.22L.48,285.28a12.21,12.21,0,0,0,12,14.63,12.49,12.49,0,0,0,2.42-.24l83.19-16.82a12.12,12.12,0,0,0,6.2-3.33l192.05-192a12.15,12.15,0,0,0,3.43-6.8c.42-2.72,3.22-27.28-25.1-55.6Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Edit extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});
    	}
    }

    /* static/icons/save.svg generated by Svelte v3.24.1 */

    function create_fragment$c(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M150,176.25a26.25,26.25,0,1,1-26.25,26.25A26.08,26.08,0,0,1,150,176.25Zm0-22.5a48.75,48.75,0,1,0,48.75,48.75A48.92,48.92,0,0,0,150,153.75ZM78.75,22.5h127.5V105H78.75Zm-52.5,0h30v93.75A11.25,11.25,0,0,0,67.5,127.5h150a11.25,11.25,0,0,0,11.25-11.25V27.19L277.5,75.94V273.75a3.52,3.52,0,0,1-3.75,3.75H26.25a3.52,3.52,0,0,1-3.75-3.75V26.25A3.52,3.52,0,0,1,26.25,22.5Zm0-22.5A26.45,26.45,0,0,0,0,26.25v247.5A26.45,26.45,0,0,0,26.25,300h247.5A26.45,26.45,0,0,0,300,273.75V71.25a11.26,11.26,0,0,0-3.28-8l-60-60a11.26,11.26,0,0,0-8-3.28Z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Save extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});
    	}
    }

    /* src/components/actions-buttons.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/components/actions-buttons.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (45:6) <Button         title={button.text}         action={button.action}         active={button.active || currentAction === button.title}       >
    function create_default_slot$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*icons*/ ctx[2][/*button*/ ctx[3].icon];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*icons*/ ctx[2][/*button*/ ctx[3].icon])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(45:6) <Button         title={button.text}         action={button.action}         active={button.active || currentAction === button.title}       >",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#each buttons as button}
    function create_each_block$2(ctx) {
    	let li;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				title: /*button*/ ctx[3].text,
    				action: /*button*/ ctx[3].action,
    				active: /*button*/ ctx[3].active || /*currentAction*/ ctx[1] === /*button*/ ctx[3].title,
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(button.$$.fragment);
    			add_location(li, file$4, 43, 4, 885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(button, li, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};
    			if (dirty & /*buttons*/ 1) button_changes.title = /*button*/ ctx[3].text;
    			if (dirty & /*buttons*/ 1) button_changes.action = /*button*/ ctx[3].action;
    			if (dirty & /*buttons, currentAction*/ 3) button_changes.active = /*button*/ ctx[3].active || /*currentAction*/ ctx[1] === /*button*/ ctx[3].title;

    			if (dirty & /*$$scope, buttons*/ 65) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(43:2) {#each buttons as button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let ul;
    	let t;
    	let li;
    	let darkmode;
    	let current;
    	let each_value = /*buttons*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	darkmode = new Dark_mode({ $$inline: true });

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			li = element("li");
    			create_component(darkmode.$$.fragment);
    			add_location(li, file$4, 53, 2, 1128);
    			attr_dev(ul, "class", "svelte-1avaqrg");
    			add_location(ul, file$4, 41, 0, 848);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t);
    			append_dev(ul, li);
    			mount_component(darkmode, li, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*buttons, currentAction, icons*/ 7) {
    				each_value = /*buttons*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(darkmode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(darkmode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			destroy_component(darkmode);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const icons = {
    		add: Add,
    		code: Code,
    		download: Download,
    		edit: Edit,
    		save: Save
    	};

    	let buttons;
    	let currentAction;

    	actions.subscribe(actions => {
    		$$invalidate(0, buttons = actions);
    	});

    	activeAction.subscribe(activeAction => {
    		$$invalidate(1, currentAction = activeAction);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Actions_buttons> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Actions_buttons", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		beforeUpdate,
    		actions,
    		activeAction,
    		Button,
    		DarkMode: Dark_mode,
    		Add,
    		Code,
    		Download,
    		Edit,
    		Save,
    		icons,
    		buttons,
    		currentAction
    	});

    	$$self.$inject_state = $$props => {
    		if ("buttons" in $$props) $$invalidate(0, buttons = $$props.buttons);
    		if ("currentAction" in $$props) $$invalidate(1, currentAction = $$props.currentAction);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [buttons, currentAction, icons];
    }

    class Actions_buttons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Actions_buttons",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    function slugify(string) {
      return string.toString().toLowerCase()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[^\w-]+/g, '')    // Remove all non-word chars
        .replace(/--+/g, '-')       // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '')         // Trim - from end of text
    }

    /* src/components/actions-area.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$5 = "src/components/actions-area.svelte";

    // (136:0) {#if !!action}
    function create_if_block$3(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block;
    	let clickOutside_action;
    	let current;
    	let mounted;
    	let dispose;

    	const if_block_creators = [
    		create_if_block_1$2,
    		create_if_block_2$1,
    		create_if_block_3$1,
    		create_if_block_4,
    		create_if_block_5
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*action*/ ctx[0] === "addUser") return 0;
    		if (/*action*/ ctx[0] === "addPalette") return 1;
    		if (/*action*/ ctx[0] === "addColor") return 2;
    		if (/*action*/ ctx[0] === "editColors") return 3;
    		if (/*action*/ ctx[0] === "seeCode") return 4;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block) if_block.c();
    			attr_dev(section, "class", "svelte-tpclez");
    			add_location(section, file$5, 136, 2, 3026);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(section, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(clickOutside_action = /*clickOutside*/ ctx[5].call(null, section)),
    					listen_dev(section, "clickOutside", /*handleClearAction*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(section, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(136:0) {#if !!action}",
    		ctx
    	});

    	return block;
    }

    // (199:35) 
    function create_if_block_5(ctx) {
    	let label;
    	let textarea;
    	let textarea_rows_value;
    	let textarea_value_value;
    	let t0;
    	let span;
    	let t2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				text: "",
    				action: /*func*/ ctx[15],
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			label = element("label");
    			textarea = element("textarea");
    			t0 = space();
    			span = element("span");
    			span.textContent = "copy or edit the code";
    			t2 = space();
    			create_component(button.$$.fragment);
    			attr_dev(textarea, "rows", textarea_rows_value = /*colors*/ ctx[1].length * 4 + 1);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "id", "colors-json");
    			attr_dev(textarea, "name", "colors-json");
    			textarea.value = textarea_value_value = JSON.stringify(/*colors*/ ctx[1], null, "  ");
    			attr_dev(textarea, "class", "svelte-tpclez");
    			add_location(textarea, file$5, 200, 8, 4661);
    			add_location(span, file$5, 208, 8, 4932);
    			attr_dev(label, "for", "colors-json");
    			attr_dev(label, "class", "svelte-tpclez");
    			add_location(label, file$5, 199, 6, 4627);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, textarea);
    			append_dev(label, t0);
    			append_dev(label, span);
    			insert_dev(target, t2, anchor);
    			mount_component(button, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*input_handler*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*colors*/ 2 && textarea_rows_value !== (textarea_rows_value = /*colors*/ ctx[1].length * 4 + 1)) {
    				attr_dev(textarea, "rows", textarea_rows_value);
    			}

    			if (!current || dirty & /*colors*/ 2 && textarea_value_value !== (textarea_value_value = JSON.stringify(/*colors*/ ctx[1], null, "  "))) {
    				prop_dev(textarea, "value", textarea_value_value);
    			}

    			const button_changes = {};
    			if (dirty & /*colors*/ 2) button_changes.action = /*func*/ ctx[15];

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t2);
    			destroy_component(button, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(199:35) ",
    		ctx
    	});

    	return block;
    }

    // (197:38) 
    function create_if_block_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("click a color name or value to change it");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(197:38) ",
    		ctx
    	});

    	return block;
    }

    // (170:36) 
    function create_if_block_3$1(ctx) {
    	let div;
    	let label0;
    	let input0;
    	let t0;
    	let span0;
    	let t2;
    	let label1;
    	let input1;
    	let t3;
    	let span1;
    	let t5;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				text: "",
    				action: /*createNewColor*/ ctx[9],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "new color name:";
    			t2 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "new color value:";
    			t5 = space();
    			create_component(button.$$.fragment);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "new-color-name");
    			attr_dev(input0, "name", "new-color-name");
    			attr_dev(input0, "class", "svelte-tpclez");
    			add_location(input0, file$5, 172, 10, 3919);
    			add_location(span0, file$5, 178, 10, 4079);
    			attr_dev(label0, "for", "new-color-name");
    			attr_dev(label0, "class", "svelte-tpclez");
    			add_location(label0, file$5, 171, 8, 3880);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "new-color-value");
    			attr_dev(input1, "name", "new-color-value");
    			attr_dev(input1, "class", "svelte-tpclez");
    			add_location(input1, file$5, 181, 10, 4173);
    			add_location(span1, file$5, 187, 10, 4336);
    			attr_dev(label1, "for", "new-color-value");
    			attr_dev(label1, "class", "svelte-tpclez");
    			add_location(label1, file$5, 180, 8, 4133);
    			add_location(div, file$5, 170, 6, 3866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*newColor*/ ctx[4].name);
    			append_dev(label0, t0);
    			append_dev(label0, span0);
    			append_dev(div, t2);
    			append_dev(div, label1);
    			append_dev(label1, input1);
    			set_input_value(input1, /*newColor*/ ctx[4].value);
    			append_dev(label1, t3);
    			append_dev(label1, span1);
    			insert_dev(target, t5, anchor);
    			mount_component(button, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newColor*/ 16 && input0.value !== /*newColor*/ ctx[4].name) {
    				set_input_value(input0, /*newColor*/ ctx[4].name);
    			}

    			if (dirty & /*newColor*/ 16 && input1.value !== /*newColor*/ ctx[4].value) {
    				set_input_value(input1, /*newColor*/ ctx[4].value);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t5);
    			destroy_component(button, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(170:36) ",
    		ctx
    	});

    	return block;
    }

    // (154:38) 
    function create_if_block_2$1(ctx) {
    	let label;
    	let input;
    	let t0;
    	let span;
    	let t2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				text: "",
    				action: /*createNewPalette*/ ctx[8],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			span.textContent = "add a new color palette:";
    			t2 = space();
    			create_component(button.$$.fragment);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "new-palette");
    			attr_dev(input, "name", "new-palette");
    			attr_dev(input, "class", "svelte-tpclez");
    			add_location(input, file$5, 155, 8, 3526);
    			add_location(span, file$5, 161, 8, 3665);
    			attr_dev(label, "for", "new-palette");
    			attr_dev(label, "class", "svelte-tpclez");
    			add_location(label, file$5, 154, 6, 3492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			set_input_value(input, /*newPalette*/ ctx[3]);
    			append_dev(label, t0);
    			append_dev(label, span);
    			insert_dev(target, t2, anchor);
    			mount_component(button, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newPalette*/ 8 && input.value !== /*newPalette*/ ctx[3]) {
    				set_input_value(input, /*newPalette*/ ctx[3]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t2);
    			destroy_component(button, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(154:38) ",
    		ctx
    	});

    	return block;
    }

    // (138:4) {#if action === 'addUser'}
    function create_if_block_1$2(ctx) {
    	let label;
    	let input;
    	let t0;
    	let span;
    	let t2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				text: "save user",
    				action: /*createNewOwner*/ ctx[7],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			span.textContent = "add a new user:";
    			t2 = space();
    			create_component(button.$$.fragment);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "new-owner");
    			attr_dev(input, "name", "new-owner");
    			attr_dev(input, "class", "svelte-tpclez");
    			add_location(input, file$5, 139, 8, 3158);
    			add_location(span, file$5, 145, 8, 3291);
    			attr_dev(label, "for", "new-owner");
    			attr_dev(label, "class", "svelte-tpclez");
    			add_location(label, file$5, 138, 6, 3126);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			set_input_value(input, /*newOwner*/ ctx[2]);
    			append_dev(label, t0);
    			append_dev(label, span);
    			insert_dev(target, t2, anchor);
    			mount_component(button, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newOwner*/ 4 && input.value !== /*newOwner*/ ctx[2]) {
    				set_input_value(input, /*newOwner*/ ctx[2]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 262144) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t2);
    			destroy_component(button, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(138:4) {#if action === 'addUser'}",
    		ctx
    	});

    	return block;
    }

    // (211:6) <Button         text=''         action={() => console.log('button click', colors)}       >
    function create_default_slot_3(ctx) {
    	let save;
    	let current;
    	save = new Save({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(save.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(save, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(save.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(save.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(save, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(211:6) <Button         text=''         action={() => console.log('button click', colors)}       >",
    		ctx
    	});

    	return block;
    }

    // (191:6) <Button         text=''         action={createNewColor}       >
    function create_default_slot_2(ctx) {
    	let save;
    	let current;
    	save = new Save({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(save.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(save, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(save.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(save.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(save, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(191:6) <Button         text=''         action={createNewColor}       >",
    		ctx
    	});

    	return block;
    }

    // (164:6) <Button         text=''         action={createNewPalette}       >
    function create_default_slot_1(ctx) {
    	let save;
    	let current;
    	save = new Save({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(save.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(save, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(save.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(save.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(save, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(164:6) <Button         text=''         action={createNewPalette}       >",
    		ctx
    	});

    	return block;
    }

    // (148:6) <Button         text='save user'         action={createNewOwner}       >
    function create_default_slot$3(ctx) {
    	let save;
    	let current;
    	save = new Save({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(save.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(save, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(save.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(save.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(save, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(148:6) <Button         text='save user'         action={createNewOwner}       >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !!/*action*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!!/*action*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*action*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let action;

    	activeAction.subscribe(currentAction => {
    		$$invalidate(0, action = currentAction);
    	});

    	const clickOutside = node => {
    		const handleClick = event => {
    			if (node && !node.contains(event.target)) {
    				node.dispatchEvent(new CustomEvent("clickOutside", node));
    			}
    		};

    		document.addEventListener("click", handleClick, true);

    		return {
    			destroy() {
    				document.removeEventListener("click", handleClick, true);
    			}
    		};
    	};

    	const handleClearAction = () => {
    		if (action !== "editColors") {
    			return activeAction.set("");
    		}
    	};

    	let colors;

    	colorPalette.subscribe(currentColorPalette => {
    		$$invalidate(1, colors = currentColorPalette);
    	});

    	let newOwner = "";
    	let newPalette = "";
    	let newColor = { name: "", value: "" };
    	let jsonCode = "";

    	const sanityPost = data => {
    		fetch("/.netlify/functions/sanity", {
    			method: "POST",
    			credentials: "same-origin",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(data)
    		}).then(response => response.json()).then(response => console.log("response", response)).catch(error => console.log("error", error));
    	};

    	const createNewOwner = () => {
    		sanityPost({
    			_type: "owner",
    			name: newOwner,
    			slug: slugify(newOwner)
    		});
    	};

    	const createNewPalette = () => {
    		sanityPost({
    			_type: "palette",
    			title: newPalette,
    			slug: slugify(newPalette),
    			colors: [],
    			owner: {
    				_ref: currentData.user,
    				_type: "reference"
    			}
    		});
    	};

    	const createNewColor = () => {
    		sanityPost({
    			_type: "palette",
    			id: currentData.palette,
    			mutations: [
    				{
    					patch: {
    						insert: {
    							after: "colors[-1]",
    							items: [
    								{
    									name: newColor.name,
    									value: newColor.value
    								}
    							]
    						}
    					}
    				}
    			]
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Actions_area> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Actions_area", $$slots, []);

    	function input_input_handler() {
    		newOwner = this.value;
    		$$invalidate(2, newOwner);
    	}

    	function input_input_handler_1() {
    		newPalette = this.value;
    		$$invalidate(3, newPalette);
    	}

    	function input0_input_handler() {
    		newColor.name = this.value;
    		$$invalidate(4, newColor);
    	}

    	function input1_input_handler() {
    		newColor.value = this.value;
    		$$invalidate(4, newColor);
    	}

    	const input_handler = event => $$invalidate(1, colors = JSON.parse(event.target.value));
    	const func = () => console.log("button click", colors);

    	$$self.$capture_state = () => ({
    		currentData,
    		activeAction,
    		colorPalette,
    		Button,
    		Save,
    		slugify,
    		action,
    		clickOutside,
    		handleClearAction,
    		colors,
    		newOwner,
    		newPalette,
    		newColor,
    		jsonCode,
    		sanityPost,
    		createNewOwner,
    		createNewPalette,
    		createNewColor
    	});

    	$$self.$inject_state = $$props => {
    		if ("action" in $$props) $$invalidate(0, action = $$props.action);
    		if ("colors" in $$props) $$invalidate(1, colors = $$props.colors);
    		if ("newOwner" in $$props) $$invalidate(2, newOwner = $$props.newOwner);
    		if ("newPalette" in $$props) $$invalidate(3, newPalette = $$props.newPalette);
    		if ("newColor" in $$props) $$invalidate(4, newColor = $$props.newColor);
    		if ("jsonCode" in $$props) jsonCode = $$props.jsonCode;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		action,
    		colors,
    		newOwner,
    		newPalette,
    		newColor,
    		clickOutside,
    		handleClearAction,
    		createNewOwner,
    		createNewPalette,
    		createNewColor,
    		input_input_handler,
    		input_input_handler_1,
    		input0_input_handler,
    		input1_input_handler,
    		input_handler,
    		func
    	];
    }

    class Actions_area extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Actions_area",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/layout.svelte generated by Svelte v3.24.1 */
    const file$6 = "src/layout.svelte";

    function create_fragment$f(ctx) {
    	let header;
    	let breadcrumbs;
    	let t0;
    	let actionsbuttons;
    	let t1;
    	let main;
    	let t2;
    	let footer;
    	let actionsarea;
    	let current;

    	breadcrumbs = new Breadcrumbs({
    			props: {
    				owner: /*owner*/ ctx[0],
    				palette: /*palette*/ ctx[1]
    			},
    			$$inline: true
    		});

    	actionsbuttons = new Actions_buttons({ $$inline: true });
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	actionsarea = new Actions_area({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(breadcrumbs.$$.fragment);
    			t0 = space();
    			create_component(actionsbuttons.$$.fragment);
    			t1 = space();
    			main = element("main");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			footer = element("footer");
    			create_component(actionsarea.$$.fragment);
    			attr_dev(header, "class", "svelte-2z1112");
    			add_location(header, file$6, 99, 0, 1802);
    			attr_dev(main, "id", "content");
    			attr_dev(main, "class", "svelte-2z1112");
    			add_location(main, file$6, 104, 0, 1877);
    			attr_dev(footer, "class", "svelte-2z1112");
    			add_location(footer, file$6, 108, 0, 1921);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(breadcrumbs, header, null);
    			append_dev(header, t0);
    			mount_component(actionsbuttons, header, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, footer, anchor);
    			mount_component(actionsarea, footer, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const breadcrumbs_changes = {};
    			if (dirty & /*owner*/ 1) breadcrumbs_changes.owner = /*owner*/ ctx[0];
    			if (dirty & /*palette*/ 2) breadcrumbs_changes.palette = /*palette*/ ctx[1];
    			breadcrumbs.$set(breadcrumbs_changes);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(breadcrumbs.$$.fragment, local);
    			transition_in(actionsbuttons.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(actionsarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(breadcrumbs.$$.fragment, local);
    			transition_out(actionsbuttons.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(actionsarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(breadcrumbs);
    			destroy_component(actionsbuttons);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(footer);
    			destroy_component(actionsarea);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { owner } = $$props;
    	let { palette } = $$props;
    	const writable_props = ["owner", "palette"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Layout", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("owner" in $$props) $$invalidate(0, owner = $$props.owner);
    		if ("palette" in $$props) $$invalidate(1, palette = $$props.palette);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Breadcrumbs,
    		ActionsButtons: Actions_buttons,
    		ActionsArea: Actions_area,
    		owner,
    		palette
    	});

    	$$self.$inject_state = $$props => {
    		if ("owner" in $$props) $$invalidate(0, owner = $$props.owner);
    		if ("palette" in $$props) $$invalidate(1, palette = $$props.palette);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [owner, palette, $$scope, $$slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { owner: 0, palette: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*owner*/ ctx[0] === undefined && !("owner" in props)) {
    			console.warn("<Layout> was created without expected prop 'owner'");
    		}

    		if (/*palette*/ ctx[1] === undefined && !("palette" in props)) {
    			console.warn("<Layout> was created without expected prop 'palette'");
    		}
    	}

    	get owner() {
    		throw new Error("<Layout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set owner(value) {
    		throw new Error("<Layout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get palette() {
    		throw new Error("<Layout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set palette(value) {
    		throw new Error("<Layout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/_fallback.svelte generated by Svelte v3.24.1 */
    const file$7 = "src/pages/_fallback.svelte";

    // (44:0) <Layout>
    function create_default_slot$4(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div1;
    	let video;
    	let source;
    	let source_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "404!";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Uh oh, this page wasn't found...";
    			t3 = space();
    			div1 = element("div");
    			video = element("video");
    			source = element("source");
    			attr_dev(h1, "class", "svelte-15yul7c");
    			add_location(h1, file$7, 45, 2, 538);
    			attr_dev(p, "class", "svelte-15yul7c");
    			add_location(p, file$7, 46, 2, 554);
    			attr_dev(div0, "class", "svelte-15yul7c");
    			add_location(div0, file$7, 44, 1, 530);
    			if (source.src !== (source_src_value = "/giphy.mp4")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$7, 51, 3, 651);
    			video.autoplay = true;
    			video.loop = true;
    			attr_dev(video, "class", "svelte-15yul7c");
    			add_location(video, file$7, 50, 2, 626);
    			attr_dev(div1, "class", "video svelte-15yul7c");
    			add_location(div1, file$7, 49, 1, 604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video);
    			append_dev(video, source);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(44:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let t;
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    			document.title = "Ouch!";
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", $$slots, []);
    	$$self.$capture_state = () => ({ Layout });
    	return [];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols) {
    			symbols = getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var isFunction_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isFunction(x) {
        return typeof x === 'function';
    }
    exports.isFunction = isFunction;

    });

    var config = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var _enable_super_gross_mode_that_will_cause_bad_things = false;
    exports.config = {
        Promise: undefined,
        set useDeprecatedSynchronousErrorHandling(value) {
            if (value) {
                var error = new Error();
                console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
            }
            else if (_enable_super_gross_mode_that_will_cause_bad_things) {
                console.log('RxJS: Back to a better error behavior. Thank you. <3');
            }
            _enable_super_gross_mode_that_will_cause_bad_things = value;
        },
        get useDeprecatedSynchronousErrorHandling() {
            return _enable_super_gross_mode_that_will_cause_bad_things;
        },
    };

    });

    var hostReportError_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function hostReportError(err) {
        setTimeout(function () { throw err; }, 0);
    }
    exports.hostReportError = hostReportError;

    });

    var Observer = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });


    exports.empty = {
        closed: true,
        next: function (value) { },
        error: function (err) {
            if (config.config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError_1.hostReportError(err);
            }
        },
        complete: function () { }
    };

    });

    var isArray = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isArray = (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

    });

    var isObject_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isObject(x) {
        return x !== null && typeof x === 'object';
    }
    exports.isObject = isObject;

    });

    var UnsubscriptionError = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var UnsubscriptionErrorImpl = (function () {
        function UnsubscriptionErrorImpl(errors) {
            Error.call(this);
            this.message = errors ?
                errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
            this.name = 'UnsubscriptionError';
            this.errors = errors;
            return this;
        }
        UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);
        return UnsubscriptionErrorImpl;
    })();
    exports.UnsubscriptionError = UnsubscriptionErrorImpl;

    });

    var Subscription_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });




    var Subscription = (function () {
        function Subscription(unsubscribe) {
            this.closed = false;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (unsubscribe) {
                this._ctorUnsubscribe = true;
                this._unsubscribe = unsubscribe;
            }
        }
        Subscription.prototype.unsubscribe = function () {
            var errors;
            if (this.closed) {
                return;
            }
            var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
            this.closed = true;
            this._parentOrParents = null;
            this._subscriptions = null;
            if (_parentOrParents instanceof Subscription) {
                _parentOrParents.remove(this);
            }
            else if (_parentOrParents !== null) {
                for (var index = 0; index < _parentOrParents.length; ++index) {
                    var parent_1 = _parentOrParents[index];
                    parent_1.remove(this);
                }
            }
            if (isFunction_1.isFunction(_unsubscribe)) {
                if (_ctorUnsubscribe) {
                    this._unsubscribe = undefined;
                }
                try {
                    _unsubscribe.call(this);
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError.UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
                }
            }
            if (isArray.isArray(_subscriptions)) {
                var index = -1;
                var len = _subscriptions.length;
                while (++index < len) {
                    var sub = _subscriptions[index];
                    if (isObject_1.isObject(sub)) {
                        try {
                            sub.unsubscribe();
                        }
                        catch (e) {
                            errors = errors || [];
                            if (e instanceof UnsubscriptionError.UnsubscriptionError) {
                                errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                            }
                            else {
                                errors.push(e);
                            }
                        }
                    }
                }
            }
            if (errors) {
                throw new UnsubscriptionError.UnsubscriptionError(errors);
            }
        };
        Subscription.prototype.add = function (teardown) {
            var subscription = teardown;
            if (!teardown) {
                return Subscription.EMPTY;
            }
            switch (typeof teardown) {
                case 'function':
                    subscription = new Subscription(teardown);
                case 'object':
                    if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                        return subscription;
                    }
                    else if (this.closed) {
                        subscription.unsubscribe();
                        return subscription;
                    }
                    else if (!(subscription instanceof Subscription)) {
                        var tmp = subscription;
                        subscription = new Subscription();
                        subscription._subscriptions = [tmp];
                    }
                    break;
                default: {
                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
                }
            }
            var _parentOrParents = subscription._parentOrParents;
            if (_parentOrParents === null) {
                subscription._parentOrParents = this;
            }
            else if (_parentOrParents instanceof Subscription) {
                if (_parentOrParents === this) {
                    return subscription;
                }
                subscription._parentOrParents = [_parentOrParents, this];
            }
            else if (_parentOrParents.indexOf(this) === -1) {
                _parentOrParents.push(this);
            }
            else {
                return subscription;
            }
            var subscriptions = this._subscriptions;
            if (subscriptions === null) {
                this._subscriptions = [subscription];
            }
            else {
                subscriptions.push(subscription);
            }
            return subscription;
        };
        Subscription.prototype.remove = function (subscription) {
            var subscriptions = this._subscriptions;
            if (subscriptions) {
                var subscriptionIndex = subscriptions.indexOf(subscription);
                if (subscriptionIndex !== -1) {
                    subscriptions.splice(subscriptionIndex, 1);
                }
            }
        };
        Subscription.EMPTY = (function (empty) {
            empty.closed = true;
            return empty;
        }(new Subscription()));
        return Subscription;
    }());
    exports.Subscription = Subscription;
    function flattenUnsubscriptionErrors(errors) {
        return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError.UnsubscriptionError) ? err.errors : err); }, []);
    }

    });

    var rxSubscriber = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rxSubscriber = (function () {
        return typeof Symbol === 'function'
            ? Symbol('rxSubscriber')
            : '@@rxSubscriber_' + Math.random();
    })();
    exports.$$rxSubscriber = exports.rxSubscriber;

    });

    var Subscriber_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });






    var Subscriber = (function (_super) {
        __extends(Subscriber, _super);
        function Subscriber(destinationOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this.syncErrorValue = null;
            _this.syncErrorThrown = false;
            _this.syncErrorThrowable = false;
            _this.isStopped = false;
            switch (arguments.length) {
                case 0:
                    _this.destination = Observer.empty;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = Observer.empty;
                        break;
                    }
                    if (typeof destinationOrNext === 'object') {
                        if (destinationOrNext instanceof Subscriber) {
                            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                            _this.destination = destinationOrNext;
                            destinationOrNext.add(_this);
                        }
                        else {
                            _this.syncErrorThrowable = true;
                            _this.destination = new SafeSubscriber(_this, destinationOrNext);
                        }
                        break;
                    }
                default:
                    _this.syncErrorThrowable = true;
                    _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                    break;
            }
            return _this;
        }
        Subscriber.prototype[rxSubscriber.rxSubscriber] = function () { return this; };
        Subscriber.create = function (next, error, complete) {
            var subscriber = new Subscriber(next, error, complete);
            subscriber.syncErrorThrowable = false;
            return subscriber;
        };
        Subscriber.prototype.next = function (value) {
            if (!this.isStopped) {
                this._next(value);
            }
        };
        Subscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                this.isStopped = true;
                this._error(err);
            }
        };
        Subscriber.prototype.complete = function () {
            if (!this.isStopped) {
                this.isStopped = true;
                this._complete();
            }
        };
        Subscriber.prototype.unsubscribe = function () {
            if (this.closed) {
                return;
            }
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        };
        Subscriber.prototype._next = function (value) {
            this.destination.next(value);
        };
        Subscriber.prototype._error = function (err) {
            this.destination.error(err);
            this.unsubscribe();
        };
        Subscriber.prototype._complete = function () {
            this.destination.complete();
            this.unsubscribe();
        };
        Subscriber.prototype._unsubscribeAndRecycle = function () {
            var _parentOrParents = this._parentOrParents;
            this._parentOrParents = null;
            this.unsubscribe();
            this.closed = false;
            this.isStopped = false;
            this._parentOrParents = _parentOrParents;
            return this;
        };
        return Subscriber;
    }(Subscription_1.Subscription));
    exports.Subscriber = Subscriber;
    var SafeSubscriber = (function (_super) {
        __extends(SafeSubscriber, _super);
        function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
            var _this = _super.call(this) || this;
            _this._parentSubscriber = _parentSubscriber;
            var next;
            var context = _this;
            if (isFunction_1.isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                next = observerOrNext.next;
                error = observerOrNext.error;
                complete = observerOrNext.complete;
                if (observerOrNext !== Observer.empty) {
                    context = Object.create(observerOrNext);
                    if (isFunction_1.isFunction(context.unsubscribe)) {
                        _this.add(context.unsubscribe.bind(context));
                    }
                    context.unsubscribe = _this.unsubscribe.bind(_this);
                }
            }
            _this._context = context;
            _this._next = next;
            _this._error = error;
            _this._complete = complete;
            return _this;
        }
        SafeSubscriber.prototype.next = function (value) {
            if (!this.isStopped && this._next) {
                var _parentSubscriber = this._parentSubscriber;
                if (!config.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._next, value);
                }
                else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.error = function (err) {
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                var useDeprecatedSynchronousErrorHandling = config.config.useDeprecatedSynchronousErrorHandling;
                if (this._error) {
                    if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(this._error, err);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, this._error, err);
                        this.unsubscribe();
                    }
                }
                else if (!_parentSubscriber.syncErrorThrowable) {
                    this.unsubscribe();
                    if (useDeprecatedSynchronousErrorHandling) {
                        throw err;
                    }
                    hostReportError_1.hostReportError(err);
                }
                else {
                    if (useDeprecatedSynchronousErrorHandling) {
                        _parentSubscriber.syncErrorValue = err;
                        _parentSubscriber.syncErrorThrown = true;
                    }
                    else {
                        hostReportError_1.hostReportError(err);
                    }
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.complete = function () {
            var _this = this;
            if (!this.isStopped) {
                var _parentSubscriber = this._parentSubscriber;
                if (this._complete) {
                    var wrappedComplete = function () { return _this._complete.call(_this._context); };
                    if (!config.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                        this.__tryOrUnsub(wrappedComplete);
                        this.unsubscribe();
                    }
                    else {
                        this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                        this.unsubscribe();
                    }
                }
                else {
                    this.unsubscribe();
                }
            }
        };
        SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                this.unsubscribe();
                if (config.config.useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                else {
                    hostReportError_1.hostReportError(err);
                }
            }
        };
        SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
            if (!config.config.useDeprecatedSynchronousErrorHandling) {
                throw new Error('bad call');
            }
            try {
                fn.call(this._context, value);
            }
            catch (err) {
                if (config.config.useDeprecatedSynchronousErrorHandling) {
                    parent.syncErrorValue = err;
                    parent.syncErrorThrown = true;
                    return true;
                }
                else {
                    hostReportError_1.hostReportError(err);
                    return true;
                }
            }
            return false;
        };
        SafeSubscriber.prototype._unsubscribe = function () {
            var _parentSubscriber = this._parentSubscriber;
            this._context = null;
            this._parentSubscriber = null;
            _parentSubscriber.unsubscribe();
        };
        return SafeSubscriber;
    }(Subscriber));
    exports.SafeSubscriber = SafeSubscriber;

    });

    var filter_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function filter(predicate, thisArg) {
        return function filterOperatorFunction(source) {
            return source.lift(new FilterOperator(predicate, thisArg));
        };
    }
    exports.filter = filter;
    var FilterOperator = (function () {
        function FilterOperator(predicate, thisArg) {
            this.predicate = predicate;
            this.thisArg = thisArg;
        }
        FilterOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
        };
        return FilterOperator;
    }());
    var FilterSubscriber = (function (_super) {
        __extends(FilterSubscriber, _super);
        function FilterSubscriber(destination, predicate, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.predicate = predicate;
            _this.thisArg = thisArg;
            _this.count = 0;
            return _this;
        }
        FilterSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.predicate.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            if (result) {
                this.destination.next(value);
            }
        };
        return FilterSubscriber;
    }(Subscriber_1.Subscriber));

    });

    var filter_1$1 = filter_1.filter;

    var filter = {
    	filter: filter_1$1
    };

    var map_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function map(project, thisArg) {
        return function mapOperation(source) {
            if (typeof project !== 'function') {
                throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
            }
            return source.lift(new MapOperator(project, thisArg));
        };
    }
    exports.map = map;
    var MapOperator = (function () {
        function MapOperator(project, thisArg) {
            this.project = project;
            this.thisArg = thisArg;
        }
        MapOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
        };
        return MapOperator;
    }());
    exports.MapOperator = MapOperator;
    var MapSubscriber = (function (_super) {
        __extends(MapSubscriber, _super);
        function MapSubscriber(destination, project, thisArg) {
            var _this = _super.call(this, destination) || this;
            _this.project = project;
            _this.count = 0;
            _this.thisArg = thisArg || _this;
            return _this;
        }
        MapSubscriber.prototype._next = function (value) {
            var result;
            try {
                result = this.project.call(this.thisArg, value, this.count++);
            }
            catch (err) {
                this.destination.error(err);
                return;
            }
            this.destination.next(result);
        };
        return MapSubscriber;
    }(Subscriber_1.Subscriber));

    });

    var map_1$1 = map_1.map;

    var map = {
    	map: map_1$1
    };

    var isObj = function (x) {
    	var type = typeof x;
    	return x !== null && (type === 'object' || type === 'function');
    };

    var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    var propIsEnumerable$1 = Object.prototype.propertyIsEnumerable;

    function toObject$1(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Sources cannot be null or undefined');
    	}

    	return Object(val);
    }

    function assignKey(to, from, key) {
    	var val = from[key];

    	if (val === undefined || val === null) {
    		return;
    	}

    	if (hasOwnProperty$1.call(to, key)) {
    		if (to[key] === undefined || to[key] === null) {
    			throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
    		}
    	}

    	if (!hasOwnProperty$1.call(to, key) || !isObj(val)) {
    		to[key] = val;
    	} else {
    		to[key] = assign$1(Object(to[key]), from[key]);
    	}
    }

    function assign$1(to, from) {
    	if (to === from) {
    		return to;
    	}

    	from = Object(from);

    	for (var key in from) {
    		if (hasOwnProperty$1.call(from, key)) {
    			assignKey(to, from, key);
    		}
    	}

    	if (Object.getOwnPropertySymbols) {
    		var symbols = Object.getOwnPropertySymbols(from);

    		for (var i = 0; i < symbols.length; i++) {
    			if (propIsEnumerable$1.call(from, symbols[i])) {
    				assignKey(to, from, symbols[i]);
    			}
    		}
    	}

    	return to;
    }

    var deepAssign = function deepAssign(target) {
    	target = toObject$1(target);

    	for (var s = 1; s < arguments.length; s++) {
    		assign$1(target, arguments[s]);
    	}

    	return target;
    };

    var getSelection = function getSelection(sel) {
      if (typeof sel === 'string' || Array.isArray(sel)) {
        return {
          id: sel
        };
      }

      if (sel && sel.query) {
        return {
          query: sel.query
        };
      }

      var selectionOpts = ['* Document ID (<docId>)', '* Array of document IDs', '* Object containing `query`'].join('\n');
      throw new Error("Unknown selection - must be one of:\n\n".concat(selectionOpts));
    };

    var validators = createCommonjsModule(function (module, exports) {

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    var VALID_ASSET_TYPES = ['image', 'file'];
    var VALID_INSERT_LOCATIONS = ['before', 'after', 'replace'];

    exports.dataset = function (name) {
      if (!/^[-\w]{1,128}$/.test(name)) {
        throw new Error('Datasets can only contain lowercase characters, numbers, underscores and dashes');
      }
    };

    exports.projectId = function (id) {
      if (!/^[-a-z0-9]+$/i.test(id)) {
        throw new Error('`projectId` can only contain only a-z, 0-9 and dashes');
      }
    };

    exports.validateAssetType = function (type) {
      if (VALID_ASSET_TYPES.indexOf(type) === -1) {
        throw new Error("Invalid asset type: ".concat(type, ". Must be one of ").concat(VALID_ASSET_TYPES.join(', ')));
      }
    };

    exports.validateObject = function (op, val) {
      if (val === null || _typeof(val) !== 'object' || Array.isArray(val)) {
        throw new Error("".concat(op, "() takes an object of properties"));
      }
    };

    exports.requireDocumentId = function (op, doc) {
      if (!doc._id) {
        throw new Error("".concat(op, "() requires that the document contains an ID (\"_id\" property)"));
      }

      exports.validateDocumentId(op, doc._id);
    };

    exports.validateDocumentId = function (op, id) {
      if (typeof id !== 'string' || !/^[a-z0-9_.-]+$/i.test(id)) {
        throw new Error("".concat(op, "(): \"").concat(id, "\" is not a valid document ID"));
      }
    };

    exports.validateInsert = function (at, selector, items) {
      var signature = 'insert(at, selector, items)';

      if (VALID_INSERT_LOCATIONS.indexOf(at) === -1) {
        var valid = VALID_INSERT_LOCATIONS.map(function (loc) {
          return "\"".concat(loc, "\"");
        }).join(', ');
        throw new Error("".concat(signature, " takes an \"at\"-argument which is one of: ").concat(valid));
      }

      if (typeof selector !== 'string') {
        throw new Error("".concat(signature, " takes a \"selector\"-argument which must be a string"));
      }

      if (!Array.isArray(items)) {
        throw new Error("".concat(signature, " takes an \"items\"-argument which must be an array"));
      }
    };

    exports.hasDataset = function (config) {
      if (!config.gradientMode && !config.dataset) {
        throw new Error('`dataset` must be provided to perform queries');
      }

      return config.dataset || '';
    };
    });

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









    var validateObject = validators.validateObject;
    var validateInsert = validators.validateInsert;

    function Patch(selection) {
      var operations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var client = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      this.selection = selection;
      this.operations = objectAssign({}, operations);
      this.client = client;
    }

    objectAssign(Patch.prototype, {
      clone: function clone() {
        return new Patch(this.selection, objectAssign({}, this.operations), this.client);
      },
      merge: function merge(props) {
        validateObject('merge', props);
        var stack = new Error().stack.toString().split('\n').filter(function (str) {
          return str.trim();
        }).slice(2);
        console.warn("The \"merge\" patch has been deprecated and will be removed in the future\n".concat(stack.join('\n')));
        return this._assign('merge', deepAssign(this.operations.merge || {}, props));
      },
      set: function set(props) {
        return this._assign('set', props);
      },
      diffMatchPatch: function diffMatchPatch(props) {
        validateObject('diffMatchPatch', props);
        return this._assign('diffMatchPatch', props);
      },
      unset: function unset(attrs) {
        if (!Array.isArray(attrs)) {
          throw new Error('unset(attrs) takes an array of attributes to unset, non-array given');
        }

        this.operations = objectAssign({}, this.operations, {
          unset: attrs
        });
        return this;
      },
      setIfMissing: function setIfMissing(props) {
        return this._assign('setIfMissing', props);
      },
      replace: function replace(props) {
        validateObject('replace', props);
        return this._set('set', {
          $: props
        }); // eslint-disable-line id-length
      },
      inc: function inc(props) {
        return this._assign('inc', props);
      },
      dec: function dec(props) {
        return this._assign('dec', props);
      },
      insert: function insert(at, selector, items) {
        var _this$_assign;

        validateInsert(at, selector, items);
        return this._assign('insert', (_this$_assign = {}, _defineProperty(_this$_assign, at, selector), _defineProperty(_this$_assign, "items", items), _this$_assign));
      },
      append: function append(selector, items) {
        return this.insert('after', "".concat(selector, "[-1]"), items);
      },
      prepend: function prepend(selector, items) {
        return this.insert('before', "".concat(selector, "[0]"), items);
      },
      splice: function splice(selector, start, deleteCount, items) {
        // Negative indexes doesn't mean the same in Sanity as they do in JS;
        // -1 means "actually at the end of the array", which allows inserting
        // at the end of the array without knowing its length. We therefore have
        // to substract negative indexes by one to match JS. If you want Sanity-
        // behaviour, just use `insert('replace', selector, items)` directly
        var delAll = typeof deleteCount === 'undefined' || deleteCount === -1;
        var startIndex = start < 0 ? start - 1 : start;
        var delCount = delAll ? -1 : Math.max(0, start + deleteCount);
        var delRange = startIndex < 0 && delCount >= 0 ? '' : delCount;
        var rangeSelector = "".concat(selector, "[").concat(startIndex, ":").concat(delRange, "]");
        return this.insert('replace', rangeSelector, items || []);
      },
      ifRevisionId: function ifRevisionId(rev) {
        this.operations.ifRevisionID = rev;
        return this;
      },
      serialize: function serialize() {
        return objectAssign(getSelection(this.selection), this.operations);
      },
      toJSON: function toJSON() {
        return this.serialize();
      },
      commit: function commit() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!this.client) {
          throw new Error('No `client` passed to patch, either provide one or pass the ' + 'patch to a clients `mutate()` method');
        }

        var returnFirst = typeof this.selection === 'string';
        var opts = objectAssign({
          returnFirst: returnFirst,
          returnDocuments: true
        }, options);
        return this.client.mutate({
          patch: this.serialize()
        }, opts);
      },
      reset: function reset() {
        this.operations = {};
        return this;
      },
      _set: function _set(op, props) {
        return this._assign(op, props, false);
      },
      _assign: function _assign(op, props) {
        var merge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        validateObject(op, props);
        this.operations = objectAssign({}, this.operations, _defineProperty({}, op, objectAssign({}, merge && this.operations[op] || {}, props)));
        return this;
      }
    });
    var patch = Patch;

    function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







    var defaultMutateOptions = {
      returnDocuments: false
    };

    function Transaction() {
      var operations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var client = arguments.length > 1 ? arguments[1] : undefined;
      var transactionId = arguments.length > 2 ? arguments[2] : undefined;
      this.trxId = transactionId;
      this.operations = operations;
      this.client = client;
    }

    objectAssign(Transaction.prototype, {
      clone: function clone() {
        return new Transaction(this.operations.slice(0), this.client, this.trxId);
      },
      create: function create(doc) {
        validators.validateObject('create', doc);
        return this._add({
          create: doc
        });
      },
      createIfNotExists: function createIfNotExists(doc) {
        var op = 'createIfNotExists';
        validators.validateObject(op, doc);
        validators.requireDocumentId(op, doc);
        return this._add(_defineProperty$1({}, op, doc));
      },
      createOrReplace: function createOrReplace(doc) {
        var op = 'createOrReplace';
        validators.validateObject(op, doc);
        validators.requireDocumentId(op, doc);
        return this._add(_defineProperty$1({}, op, doc));
      },
      delete: function _delete(documentId) {
        validators.validateDocumentId('delete', documentId);
        return this._add({
          delete: {
            id: documentId
          }
        });
      },
      patch: function patch$1(documentId, patchOps) {
        var isBuilder = typeof patchOps === 'function';
        var isPatch = documentId instanceof patch; // transaction.patch(client.patch('documentId').inc({visits: 1}))

        if (isPatch) {
          return this._add({
            patch: documentId.serialize()
          });
        } // patch => patch.inc({visits: 1}).set({foo: 'bar'})


        if (isBuilder) {
          var patch$1 = patchOps(new patch(documentId, {}, this.client));

          if (!(patch$1 instanceof patch)) {
            throw new Error('function passed to `patch()` must return the patch');
          }

          return this._add({
            patch: patch$1.serialize()
          });
        }

        return this._add({
          patch: objectAssign({
            id: documentId
          }, patchOps)
        });
      },
      transactionId: function transactionId(id) {
        if (!id) {
          return this.trxId;
        }

        this.trxId = id;
        return this;
      },
      serialize: function serialize() {
        return this.operations.slice();
      },
      toJSON: function toJSON() {
        return this.serialize();
      },
      commit: function commit(options) {
        if (!this.client) {
          throw new Error('No `client` passed to transaction, either provide one or pass the ' + 'transaction to a clients `mutate()` method');
        }

        return this.client.mutate(this.serialize(), objectAssign({
          transactionId: this.trxId
        }, defaultMutateOptions, options || {}));
      },
      reset: function reset() {
        this.operations = [];
        return this;
      },
      _add: function _add(mut) {
        this.operations.push(mut);
        return this;
      }
    });
    var transaction = Transaction;

    var enc = encodeURIComponent;

    var encodeQueryString = function (_ref) {
      var query = _ref.query,
          _ref$params = _ref.params,
          params = _ref$params === void 0 ? {} : _ref$params,
          _ref$options = _ref.options,
          options = _ref$options === void 0 ? {} : _ref$options;
      var base = "?query=".concat(enc(query));
      var qString = Object.keys(params).reduce(function (qs, param) {
        return "".concat(qs, "&").concat(enc("$".concat(param)), "=").concat(enc(JSON.stringify(params[param])));
      }, base);
      return Object.keys(options).reduce(function (qs, option) {
        // Only include the option if it is truthy
        return options[option] ? "".concat(qs, "&").concat(enc(option), "=").concat(enc(options[option])) : qs;
      }, qString);
    };

    var canReportError_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    function canReportError(observer) {
        while (observer) {
            var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
            if (closed_1 || isStopped) {
                return false;
            }
            else if (destination && destination instanceof Subscriber_1.Subscriber) {
                observer = destination;
            }
            else {
                observer = null;
            }
        }
        return true;
    }
    exports.canReportError = canReportError;

    });

    var toSubscriber_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });



    function toSubscriber(nextOrObserver, error, complete) {
        if (nextOrObserver) {
            if (nextOrObserver instanceof Subscriber_1.Subscriber) {
                return nextOrObserver;
            }
            if (nextOrObserver[rxSubscriber.rxSubscriber]) {
                return nextOrObserver[rxSubscriber.rxSubscriber]();
            }
        }
        if (!nextOrObserver && !error && !complete) {
            return new Subscriber_1.Subscriber(Observer.empty);
        }
        return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
    }
    exports.toSubscriber = toSubscriber;

    });

    var observable = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.observable = (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

    });

    var identity_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function identity(x) {
        return x;
    }
    exports.identity = identity;

    });

    var pipe_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    function pipe() {
        var fns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fns[_i] = arguments[_i];
        }
        return pipeFromArray(fns);
    }
    exports.pipe = pipe;
    function pipeFromArray(fns) {
        if (fns.length === 0) {
            return identity_1.identity;
        }
        if (fns.length === 1) {
            return fns[0];
        }
        return function piped(input) {
            return fns.reduce(function (prev, fn) { return fn(prev); }, input);
        };
    }
    exports.pipeFromArray = pipeFromArray;

    });

    var Observable_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });





    var Observable = (function () {
        function Observable(subscribe) {
            this._isScalar = false;
            if (subscribe) {
                this._subscribe = subscribe;
            }
        }
        Observable.prototype.lift = function (operator) {
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
        };
        Observable.prototype.subscribe = function (observerOrNext, error, complete) {
            var operator = this.operator;
            var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
            if (operator) {
                sink.add(operator.call(sink, this.source));
            }
            else {
                sink.add(this.source || (config.config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                    this._subscribe(sink) :
                    this._trySubscribe(sink));
            }
            if (config.config.useDeprecatedSynchronousErrorHandling) {
                if (sink.syncErrorThrowable) {
                    sink.syncErrorThrowable = false;
                    if (sink.syncErrorThrown) {
                        throw sink.syncErrorValue;
                    }
                }
            }
            return sink;
        };
        Observable.prototype._trySubscribe = function (sink) {
            try {
                return this._subscribe(sink);
            }
            catch (err) {
                if (config.config.useDeprecatedSynchronousErrorHandling) {
                    sink.syncErrorThrown = true;
                    sink.syncErrorValue = err;
                }
                if (canReportError_1.canReportError(sink)) {
                    sink.error(err);
                }
                else {
                    console.warn(err);
                }
            }
        };
        Observable.prototype.forEach = function (next, promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var subscription;
                subscription = _this.subscribe(function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
                }, reject, resolve);
            });
        };
        Observable.prototype._subscribe = function (subscriber) {
            var source = this.source;
            return source && source.subscribe(subscriber);
        };
        Observable.prototype[observable.observable] = function () {
            return this;
        };
        Observable.prototype.pipe = function () {
            var operations = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                operations[_i] = arguments[_i];
            }
            if (operations.length === 0) {
                return this;
            }
            return pipe_1.pipeFromArray(operations)(this);
        };
        Observable.prototype.toPromise = function (promiseCtor) {
            var _this = this;
            promiseCtor = getPromiseCtor(promiseCtor);
            return new promiseCtor(function (resolve, reject) {
                var value;
                _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
            });
        };
        Observable.create = function (subscribe) {
            return new Observable(subscribe);
        };
        return Observable;
    }());
    exports.Observable = Observable;
    function getPromiseCtor(promiseCtor) {
        if (!promiseCtor) {
            promiseCtor = config.config.Promise || Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
    }

    });

    var scan_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function scan(accumulator, seed) {
        var hasSeed = false;
        if (arguments.length >= 2) {
            hasSeed = true;
        }
        return function scanOperatorFunction(source) {
            return source.lift(new ScanOperator(accumulator, seed, hasSeed));
        };
    }
    exports.scan = scan;
    var ScanOperator = (function () {
        function ScanOperator(accumulator, seed, hasSeed) {
            if (hasSeed === void 0) { hasSeed = false; }
            this.accumulator = accumulator;
            this.seed = seed;
            this.hasSeed = hasSeed;
        }
        ScanOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
        };
        return ScanOperator;
    }());
    var ScanSubscriber = (function (_super) {
        __extends(ScanSubscriber, _super);
        function ScanSubscriber(destination, accumulator, _seed, hasSeed) {
            var _this = _super.call(this, destination) || this;
            _this.accumulator = accumulator;
            _this._seed = _seed;
            _this.hasSeed = hasSeed;
            _this.index = 0;
            return _this;
        }
        Object.defineProperty(ScanSubscriber.prototype, "seed", {
            get: function () {
                return this._seed;
            },
            set: function (value) {
                this.hasSeed = true;
                this._seed = value;
            },
            enumerable: true,
            configurable: true
        });
        ScanSubscriber.prototype._next = function (value) {
            if (!this.hasSeed) {
                this.seed = value;
                this.destination.next(value);
            }
            else {
                return this._tryNext(value);
            }
        };
        ScanSubscriber.prototype._tryNext = function (value) {
            var index = this.index++;
            var result;
            try {
                result = this.accumulator(this.seed, value, index);
            }
            catch (err) {
                this.destination.error(err);
            }
            this.seed = result;
            this.destination.next(result);
        };
        return ScanSubscriber;
    }(Subscriber_1.Subscriber));

    });

    var ArgumentOutOfRangeError = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ArgumentOutOfRangeErrorImpl = (function () {
        function ArgumentOutOfRangeErrorImpl() {
            Error.call(this);
            this.message = 'argument out of range';
            this.name = 'ArgumentOutOfRangeError';
            return this;
        }
        ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype);
        return ArgumentOutOfRangeErrorImpl;
    })();
    exports.ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;

    });

    var empty_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.EMPTY = new Observable_1.Observable(function (subscriber) { return subscriber.complete(); });
    function empty(scheduler) {
        return scheduler ? emptyScheduled(scheduler) : exports.EMPTY;
    }
    exports.empty = empty;
    function emptyScheduled(scheduler) {
        return new Observable_1.Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
    }

    });

    var takeLast_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });



    function takeLast(count) {
        return function takeLastOperatorFunction(source) {
            if (count === 0) {
                return empty_1.empty();
            }
            else {
                return source.lift(new TakeLastOperator(count));
            }
        };
    }
    exports.takeLast = takeLast;
    var TakeLastOperator = (function () {
        function TakeLastOperator(total) {
            this.total = total;
            if (this.total < 0) {
                throw new ArgumentOutOfRangeError.ArgumentOutOfRangeError;
            }
        }
        TakeLastOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TakeLastSubscriber(subscriber, this.total));
        };
        return TakeLastOperator;
    }());
    var TakeLastSubscriber = (function (_super) {
        __extends(TakeLastSubscriber, _super);
        function TakeLastSubscriber(destination, total) {
            var _this = _super.call(this, destination) || this;
            _this.total = total;
            _this.ring = new Array();
            _this.count = 0;
            return _this;
        }
        TakeLastSubscriber.prototype._next = function (value) {
            var ring = this.ring;
            var total = this.total;
            var count = this.count++;
            if (ring.length < total) {
                ring.push(value);
            }
            else {
                var index = count % total;
                ring[index] = value;
            }
        };
        TakeLastSubscriber.prototype._complete = function () {
            var destination = this.destination;
            var count = this.count;
            if (count > 0) {
                var total = this.count >= this.total ? this.total : this.count;
                var ring = this.ring;
                for (var i = 0; i < total; i++) {
                    var idx = (count++) % total;
                    destination.next(ring[idx]);
                }
            }
            destination.complete();
        };
        return TakeLastSubscriber;
    }(Subscriber_1.Subscriber));

    });

    var defaultIfEmpty_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });

    function defaultIfEmpty(defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return function (source) { return source.lift(new DefaultIfEmptyOperator(defaultValue)); };
    }
    exports.defaultIfEmpty = defaultIfEmpty;
    var DefaultIfEmptyOperator = (function () {
        function DefaultIfEmptyOperator(defaultValue) {
            this.defaultValue = defaultValue;
        }
        DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
        };
        return DefaultIfEmptyOperator;
    }());
    var DefaultIfEmptySubscriber = (function (_super) {
        __extends(DefaultIfEmptySubscriber, _super);
        function DefaultIfEmptySubscriber(destination, defaultValue) {
            var _this = _super.call(this, destination) || this;
            _this.defaultValue = defaultValue;
            _this.isEmpty = true;
            return _this;
        }
        DefaultIfEmptySubscriber.prototype._next = function (value) {
            this.isEmpty = false;
            this.destination.next(value);
        };
        DefaultIfEmptySubscriber.prototype._complete = function () {
            if (this.isEmpty) {
                this.destination.next(this.defaultValue);
            }
            this.destination.complete();
        };
        return DefaultIfEmptySubscriber;
    }(Subscriber_1.Subscriber));

    });

    var reduce_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });




    function reduce(accumulator, seed) {
        if (arguments.length >= 2) {
            return function reduceOperatorFunctionWithSeed(source) {
                return pipe_1.pipe(scan_1.scan(accumulator, seed), takeLast_1.takeLast(1), defaultIfEmpty_1.defaultIfEmpty(seed))(source);
            };
        }
        return function reduceOperatorFunction(source) {
            return pipe_1.pipe(scan_1.scan(function (acc, value, index) { return accumulator(acc, value, index + 1); }), takeLast_1.takeLast(1))(source);
        };
    }
    exports.reduce = reduce;

    });

    var reduce_1$1 = reduce_1.reduce;

    var reduce = {
    	reduce: reduce_1$1
    };

    var Observable = Observable_1.Observable;



    var map$1 = map.map;

    var filter$1 = filter.filter;

    var reduce$1 = reduce.reduce;
    /*
     A minimal rxjs based observable that align as closely as possible with the current es-observable spec,
     without the static factory methods
     */


    function SanityObservableMinimal() {
      Observable.apply(this, arguments); // eslint-disable-line prefer-rest-params
    }

    SanityObservableMinimal.prototype = Object.create(objectAssign(Object.create(null), Observable.prototype));
    Object.defineProperty(SanityObservableMinimal.prototype, 'constructor', {
      value: SanityObservableMinimal,
      enumerable: false,
      writable: true,
      configurable: true
    });

    SanityObservableMinimal.prototype.lift = function lift(operator) {
      var observable = new SanityObservableMinimal();
      observable.source = this;
      observable.operator = operator;
      return observable;
    };

    function createDeprecatedMemberOp(name, op) {
      var hasWarned = false;
      return function deprecatedOperator() {
        if (!hasWarned) {
          hasWarned = true;
          console.warn(new Error("Calling observable.".concat(name, "(...) is deprecated. Please use observable.pipe(").concat(name, "(...)) instead")));
        }

        return this.pipe(op.apply(this, arguments));
      };
    }

    SanityObservableMinimal.prototype.map = createDeprecatedMemberOp('map', map$1);
    SanityObservableMinimal.prototype.filter = createDeprecatedMemberOp('filter', filter$1);
    SanityObservableMinimal.prototype.reduce = createDeprecatedMemberOp('filter', reduce$1);
    var SanityObservableMinimal_1 = SanityObservableMinimal;

    var minimal = SanityObservableMinimal_1;

    var eventsource = createCommonjsModule(function (module) {
    (function (root, factory) {
      /* global define */
      if ( module.exports) {
        // CommonJS
        module.exports = factory();
      } else {
        // Browser globals (root is window)
        if (commonjsGlobal.EventSource && !commonjsGlobal._eventSourceImportPrefix) {
          return
        }

        var evsImportName = (root._eventSourceImportPrefix || '') + 'EventSource';
        root[evsImportName] = factory();
      }
    })(typeof self === 'undefined' ? commonjsGlobal : self, function () {
      var EventSource = function (url, options) {
        if (!url || typeof url != 'string') {
          throw new SyntaxError('Not enough arguments')
        }

        this.URL = url;
        this.setOptions(options);
        var evs = this;
        setTimeout(function () {
          evs.poll();
        }, 0);
      };

      EventSource.prototype = {
        CONNECTING: 0,

        OPEN: 1,

        CLOSED: 2,

        defaultOptions: {
          loggingEnabled: false,

          loggingPrefix: 'eventsource',

          interval: 500, // milliseconds

          bufferSizeLimit: 256 * 1024, // bytes

          silentTimeout: 300000, // milliseconds

          getArgs: {
            evs_buffer_size_limit: 256 * 1024,
          },

          xhrHeaders: {
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest',
          },
        },

        setOptions: function (options) {
          var defaults = this.defaultOptions;
          var option;

          // set all default options...
          for (option in defaults) {
            if (defaults.hasOwnProperty(option)) {
              this[option] = defaults[option];
            }
          }

          // override with what is in options
          for (option in options) {
            if (option in defaults && options.hasOwnProperty(option)) {
              this[option] = options[option];
            }
          }

          // if getArgs option is enabled
          // ensure evs_buffer_size_limit corresponds to bufferSizeLimit
          if (this.getArgs && this.bufferSizeLimit) {
            this.getArgs.evs_buffer_size_limit = this.bufferSizeLimit;
          }

          // if console is not available, force loggingEnabled to false
          // eslint-disable-next-line no-console
          if (typeof console === 'undefined' || typeof console.log === 'undefined') {
            this.loggingEnabled = false;
          }
        },

        log: function (message) {
          if (this.loggingEnabled) {
            // eslint-disable-next-line no-console
            console.log('[' + this.loggingPrefix + ']:' + message);
          }
        },

        poll: function () {
          try {
            if (this.readyState == this.CLOSED) {
              return
            }

            this.cleanup();
            this.readyState = this.CONNECTING;
            this.cursor = 0;
            this.cache = '';
            this._xhr = new this.XHR(this);
            this.resetNoActivityTimer();
          } catch (err) {
            // in an attempt to silence the errors
            this.log('There were errors inside the pool try-catch');
            this.dispatchEvent('error', {type: 'error', data: err.message});
          }
        },

        pollAgain: function (interval) {
          // schedule poll to be called after interval milliseconds
          var evs = this;
          evs.readyState = evs.CONNECTING;
          evs.dispatchEvent('error', {
            type: 'error',
            data: 'Reconnecting ',
          });
          this._pollTimer = setTimeout(function () {
            evs.poll();
          }, interval || 0);
        },

        cleanup: function () {
          this.log('evs cleaning up');

          if (this._pollTimer) {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
          }

          if (this._noActivityTimer) {
            clearInterval(this._noActivityTimer);
            this._noActivityTimer = null;
          }

          if (this._xhr) {
            this._xhr.abort();
            this._xhr = null;
          }
        },

        resetNoActivityTimer: function () {
          if (this.silentTimeout) {
            if (this._noActivityTimer) {
              clearInterval(this._noActivityTimer);
            }
            var evs = this;
            this._noActivityTimer = setTimeout(function () {
              evs.log('Timeout! silentTImeout:' + evs.silentTimeout);
              evs.pollAgain();
            }, this.silentTimeout);
          }
        },

        close: function () {
          this.readyState = this.CLOSED;
          this.log('Closing connection. readyState: ' + this.readyState);
          this.cleanup();
        },

        _onxhrdata: function () {
          var request = this._xhr;

          if (request.isReady() && !request.hasError()) {
            // reset the timer, as we have activity
            this.resetNoActivityTimer();

            // move this EventSource to OPEN state...
            if (this.readyState == this.CONNECTING) {
              this.readyState = this.OPEN;
              this.dispatchEvent('open', {type: 'open'});
            }

            var buffer = request.getBuffer();

            if (buffer.length > this.bufferSizeLimit) {
              this.log('buffer.length > this.bufferSizeLimit');
              this.pollAgain();
            }

            if (this.cursor == 0 && buffer.length > 0) {
              // skip byte order mark \uFEFF character if it starts the stream
              if (buffer.substring(0, 1) == '\uFEFF') {
                this.cursor = 1;
              }
            }

            var lastMessageIndex = this.lastMessageIndex(buffer);
            if (lastMessageIndex[0] >= this.cursor) {
              var newcursor = lastMessageIndex[1];
              var toparse = buffer.substring(this.cursor, newcursor);
              this.parseStream(toparse);
              this.cursor = newcursor;
            }

            // if request is finished, reopen the connection
            if (request.isDone()) {
              this.log('request.isDone(). reopening the connection');
              this.pollAgain(this.interval);
            }
          } else if (this.readyState !== this.CLOSED) {
            this.log('this.readyState !== this.CLOSED');
            this.pollAgain(this.interval);

            //MV: Unsure why an error was previously dispatched
          }
        },

        parseStream: function (chunk) {
          // normalize line separators (\r\n,\r,\n) to \n
          // remove white spaces that may precede \n
          chunk = this.cache + this.normalizeToLF(chunk);

          var events = chunk.split('\n\n');

          var i, j, eventType, datas, line, retry;

          for (i = 0; i < events.length - 1; i++) {
            eventType = 'message';
            datas = [];
            var parts = events[i].split('\n');

            for (j = 0; j < parts.length; j++) {
              line = this.trimWhiteSpace(parts[j]);

              if (line.indexOf('event') == 0) {
                eventType = line.replace(/event:?\s*/, '');
              } else if (line.indexOf('retry') == 0) {
                retry = parseInt(line.replace(/retry:?\s*/, ''), 10);
                if (!isNaN(retry)) {
                  this.interval = retry;
                }
              } else if (line.indexOf('data') == 0) {
                datas.push(line.replace(/data:?\s*/, ''));
              } else if (line.indexOf('id:') == 0) {
                this.lastEventId = line.replace(/id:?\s*/, '');
              } else if (line.indexOf('id') == 0) {
                // this resets the id

                this.lastEventId = null;
              }
            }

            if (datas.length && this.readyState != this.CLOSED) {
              // dispatch a new event
              var event = new MessageEvent(
                eventType,
                datas.join('\n'),
                typeof window !== 'undefined' && typeof window.location !== 'undefined'
                  ? window.location.origin
                  : null,
                this.lastEventId
              );
              this.dispatchEvent(eventType, event);
            }
          }

          this.cache = events[events.length - 1];
        },

        dispatchEvent: function (type, event) {
          var handlers = this['_' + type + 'Handlers'];

          if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
              handlers[i].call(this, event);
            }
          }

          if (this['on' + type]) {
            this['on' + type].call(this, event);
          }
        },

        addEventListener: function (type, handler) {
          if (!this['_' + type + 'Handlers']) {
            this['_' + type + 'Handlers'] = [];
          }

          this['_' + type + 'Handlers'].push(handler);
        },

        removeEventListener: function (type, handler) {
          var handlers = this['_' + type + 'Handlers'];
          if (!handlers) {
            return
          }
          for (var i = handlers.length - 1; i >= 0; --i) {
            if (handlers[i] === handler) {
              handlers.splice(i, 1);
              break
            }
          }
        },

        _pollTimer: null,

        _noactivityTimer: null,

        _xhr: null,

        lastEventId: null,

        cache: '',

        cursor: 0,

        onerror: null,

        onmessage: null,

        onopen: null,

        readyState: 0,

        // ===================================================================
        // helpers functions
        // those are attached to prototype to ease reuse and testing...

        urlWithParams: function (baseURL, params) {
          var encodedArgs = [];

          if (params) {
            var key, urlarg;
            var urlize = encodeURIComponent;

            for (key in params) {
              if (params.hasOwnProperty(key)) {
                urlarg = urlize(key) + '=' + urlize(params[key]);
                encodedArgs.push(urlarg);
              }
            }
          }

          if (encodedArgs.length > 0) {
            if (baseURL.indexOf('?') == -1) return baseURL + '?' + encodedArgs.join('&')
            return baseURL + '&' + encodedArgs.join('&')
          }
          return baseURL
        },

        lastMessageIndex: function (text) {
          var ln2 = text.lastIndexOf('\n\n');
          var lr2 = text.lastIndexOf('\r\r');
          var lrln2 = text.lastIndexOf('\r\n\r\n');

          if (lrln2 > Math.max(ln2, lr2)) {
            return [lrln2, lrln2 + 4]
          }
          return [Math.max(ln2, lr2), Math.max(ln2, lr2) + 2]
        },

        trimWhiteSpace: function (str) {
          // to remove whitespaces left and right of string

          var reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
          return str.replace(reTrim, '')
        },

        normalizeToLF: function (str) {
          // replace \r and \r\n with \n
          return str.replace(/\r\n|\r/g, '\n')
        },
      };

      if (isOldIE()) {
        EventSource.isPolyfill = 'IE_8-9';

        // patch EventSource defaultOptions
        var defaults = EventSource.prototype.defaultOptions;
        defaults.xhrHeaders = null; // no headers will be sent
        defaults.getArgs.evs_preamble = 2048 + 8;

        // EventSource will send request using Internet Explorer XDomainRequest
        EventSource.prototype.XHR = function (evs) {
          /* global XDomainRequest */
          var request = new XDomainRequest();
          this._request = request;

          // set handlers
          request.onprogress = function () {
            request._ready = true;
            evs._onxhrdata();
          };

          request.onload = function () {
            this._loaded = true;
            evs._onxhrdata();
          };

          request.onerror = function () {
            this._failed = true;
            evs.readyState = evs.CLOSED;
            evs.dispatchEvent('error', {
              type: 'error',
              data: 'XDomainRequest error',
            });
          };

          request.ontimeout = function () {
            this._failed = true;
            evs.readyState = evs.CLOSED;
            evs.dispatchEvent('error', {
              type: 'error',
              data: 'XDomainRequest timed out',
            });
          };

          // XDomainRequest does not allow setting custom headers
          // If EventSource has enabled the use of GET arguments
          // we add parameters to URL so that server can adapt the stream...
          var reqGetArgs = {};
          if (evs.getArgs) {
            // copy evs.getArgs in reqGetArgs
            var defaultArgs = evs.getArgs;
            for (var key in defaultArgs) {
              if (defaultArgs.hasOwnProperty(key)) {
                reqGetArgs[key] = defaultArgs[key];
              }
            }
            if (evs.lastEventId) {
              reqGetArgs.evs_last_event_id = evs.lastEventId;
            }
          }
          // send the request

          request.open('GET', evs.urlWithParams(evs.URL, reqGetArgs));
          request.send();
        };

        EventSource.prototype.XHR.prototype = {
          useXDomainRequest: true,

          _request: null,

          _ready: false, // true when progress events are dispatched

          _loaded: false, // true when request has been loaded

          _failed: false, // true if when request is in error

          isReady: function () {
            return this._request._ready
          },

          isDone: function () {
            return this._request._loaded
          },

          hasError: function () {
            return this._request._failed
          },

          getBuffer: function () {
            var rv = '';
            try {
              rv = this._request.responseText || '';
            } catch (err) {
              // intentional noop
            }
            return rv
          },

          abort: function () {
            if (this._request) {
              this._request.abort();
            }
          },
        };
      } else {
        EventSource.isPolyfill = 'XHR';

        // EventSource will send request using XMLHttpRequest
        EventSource.prototype.XHR = function (evs) {
          var request = new XMLHttpRequest();
          this._request = request;
          evs._xhr = this;

          // set handlers
          request.onreadystatechange = function () {
            if (request.readyState > 1 && evs.readyState != evs.CLOSED) {
              if (request.status == 200 || (request.status >= 300 && request.status < 400)) {
                evs._onxhrdata();
              } else {
                request._failed = true;
                evs.readyState = evs.CLOSED;
                evs.dispatchEvent('error', {
                  type: 'error',
                  data: 'The server responded with ' + request.status,
                });
                evs.close();
              }
            }
          };

          request.onprogress = function () {
            // intentional noop
          };

          request.open('GET', evs.urlWithParams(evs.URL, evs.getArgs), true);

          var headers = evs.xhrHeaders; // maybe null
          for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
              request.setRequestHeader(header, headers[header]);
            }
          }
          if (evs.lastEventId) {
            request.setRequestHeader('Last-Event-Id', evs.lastEventId);
          }

          request.send();
        };

        EventSource.prototype.XHR.prototype = {
          useXDomainRequest: false,

          _request: null,

          _failed: false, // true if we have had errors...

          isReady: function () {
            return this._request.readyState >= 2
          },

          isDone: function () {
            return this._request.readyState == 4
          },

          hasError: function () {
            return this._failed || this._request.status >= 400
          },

          getBuffer: function () {
            var rv = '';
            try {
              rv = this._request.responseText || '';
            } catch (err) {
              // intentional noop
            }
            return rv
          },

          abort: function () {
            if (this._request) {
              this._request.abort();
            }
          },
        };
      }

      function MessageEvent(type, data, origin, lastEventId) {
        this.bubbles = false;
        this.cancelBubble = false;
        this.cancelable = false;
        this.data = data || null;
        this.origin = origin || '';
        this.lastEventId = lastEventId || '';
        this.type = type || 'message';
      }

      function isOldIE() {
        //return true if we are in IE8 or IE9
        return Boolean(
          typeof window !== 'undefined' &&
            window.XDomainRequest &&
            window.XMLHttpRequest &&
            new XMLHttpRequest().responseType === undefined
        )
      }

      return EventSource
    });
    });

    /* eslint-disable no-var */


    var browser = window.EventSource || eventsource.EventSource;

    var pick = function (obj, props) {
      return props.reduce(function (selection, prop) {
        if (typeof obj[prop] === 'undefined') {
          return selection;
        }

        selection[prop] = obj[prop];
        return selection;
      }, {});
    };

    var defaults$1 = function (obj, defaults) {
      return Object.keys(defaults).concat(Object.keys(obj)).reduce(function (target, prop) {
        target[prop] = typeof obj[prop] === 'undefined' ? defaults[prop] : obj[prop];
        return target;
      }, {});
    };

    var baseUrl = 'https://docs.sanity.io/help/';

    var generateHelpUrl = function generateHelpUrl(slug) {
      return baseUrl + slug
    };

    var once = function (fn) {
      var didCall = false;
      var returnValue;
      return function () {
        if (didCall) {
          return returnValue;
        }

        returnValue = fn.apply(void 0, arguments);
        didCall = true;
        return returnValue;
      };
    };

    var tokenWarning = ['Using token with listeners is not supported in browsers. ', "For more info, see ".concat(generateHelpUrl('js-client-listener-tokens-browser'), ".")]; // eslint-disable-next-line no-console

    var printTokenWarning = once(function () {
      return console.warn(tokenWarning.join(' '));
    });
    var isWindowEventSource = Boolean(typeof window !== 'undefined' && window.EventSource);
    var EventSource = isWindowEventSource ? window.EventSource // Native browser EventSource
    : browser; // Node.js, IE etc

    var possibleOptions = ['includePreviousRevision', 'includeResult', 'visibility', 'effectFormat'];
    var defaultOptions = {
      includeResult: true
    };

    var listen$1 = function listen(query, params) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var options = defaults$1(opts, defaultOptions);
      var listenOpts = pick(options, possibleOptions);
      var qs = encodeQueryString({
        query: query,
        params: params,
        options: listenOpts
      });
      var _this$clientConfig = this.clientConfig,
          url = _this$clientConfig.url,
          token = _this$clientConfig.token,
          withCredentials = _this$clientConfig.withCredentials;
      var uri = "".concat(url).concat(this.getDataUrl('listen', qs));
      var listenFor = options.events ? options.events : ['mutation'];
      var shouldEmitReconnect = listenFor.indexOf('reconnect') !== -1;

      if (token && isWindowEventSource) {
        printTokenWarning();
      }

      var esOptions = {};

      if (token || withCredentials) {
        esOptions.withCredentials = true;
      }

      if (token) {
        esOptions.headers = {
          Authorization: "Bearer ".concat(token)
        };
      }

      return new minimal(function (observer) {
        var es = getEventSource();
        var reconnectTimer;
        var stopped = false;

        function onError() {
          if (stopped) {
            return;
          }

          emitReconnect(); // Allow event handlers of `emitReconnect` to cancel/close the reconnect attempt

          if (stopped) {
            return;
          } // Unless we've explicitly stopped the ES (in which case `stopped` should be true),
          // we should never be in a disconnected state. By default, EventSource will reconnect
          // automatically, in which case it sets readyState to `CONNECTING`, but in some cases
          // (like when a laptop lid is closed), it closes the connection. In these cases we need
          // to explicitly reconnect.


          if (es.readyState === EventSource.CLOSED) {
            unsubscribe();
            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(open, 100);
          }
        }

        function onChannelError(err) {
          observer.error(cooerceError(err));
        }

        function onMessage(evt) {
          var event = parseEvent(evt);
          return event instanceof Error ? observer.error(event) : observer.next(event);
        }

        function onDisconnect(evt) {
          stopped = true;
          unsubscribe();
          observer.complete();
        }

        function unsubscribe() {
          es.removeEventListener('error', onError, false);
          es.removeEventListener('channelError', onChannelError, false);
          es.removeEventListener('disconnect', onDisconnect, false);
          listenFor.forEach(function (type) {
            return es.removeEventListener(type, onMessage, false);
          });
          es.close();
        }

        function emitReconnect() {
          if (shouldEmitReconnect) {
            observer.next({
              type: 'reconnect'
            });
          }
        }

        function getEventSource() {
          var evs = new EventSource(uri, esOptions);
          evs.addEventListener('error', onError, false);
          evs.addEventListener('channelError', onChannelError, false);
          evs.addEventListener('disconnect', onDisconnect, false);
          listenFor.forEach(function (type) {
            return evs.addEventListener(type, onMessage, false);
          });
          return evs;
        }

        function open() {
          es = getEventSource();
        }

        function stop() {
          stopped = true;
          unsubscribe();
        }

        return stop;
      });
    };

    function parseEvent(event) {
      try {
        var data = event.data && JSON.parse(event.data) || {};
        return objectAssign({
          type: event.type
        }, data);
      } catch (err) {
        return err;
      }
    }

    function cooerceError(err) {
      if (err instanceof Error) {
        return err;
      }

      var evt = parseEvent(err);
      return evt instanceof Error ? evt : new Error(extractErrorMessage(evt));
    }

    function extractErrorMessage(err) {
      if (!err.error) {
        return err.message || 'Unknown listener error';
      }

      if (err.error.description) {
        return err.error.description;
      }

      return typeof err.error === 'string' ? err.error : JSON.stringify(err.error, null, 2);
    }

    function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



    var filter$2 = filter.filter;

    var map$2 = map.map;













    var excludeFalsey = function excludeFalsey(param, defValue) {
      var value = typeof param === 'undefined' ? defValue : param;
      return param === false ? undefined : value;
    };

    var getMutationQuery = function getMutationQuery() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return {
        returnIds: true,
        returnDocuments: excludeFalsey(options.returnDocuments, true),
        visibility: options.visibility || 'sync'
      };
    };

    var isResponse = function isResponse(event) {
      return event.type === 'response';
    };

    var getBody = function getBody(event) {
      return event.body;
    };

    var indexBy = function indexBy(docs, attr) {
      return docs.reduce(function (indexed, doc) {
        indexed[attr(doc)] = doc;
        return indexed;
      }, Object.create(null));
    };

    var toPromise = function toPromise(observable) {
      return observable.toPromise();
    };

    var getQuerySizeLimit = 11264;
    var dataMethods = {
      listen: listen$1,
      getDataUrl: function getDataUrl(operation, path) {
        var config = this.clientConfig;
        var catalog = config.gradientMode ? config.namespace : validators.hasDataset(config);
        var baseUri = "/".concat(operation, "/").concat(catalog);
        var uri = path ? "".concat(baseUri, "/").concat(path) : baseUri;
        return (this.clientConfig.gradientMode ? uri : "/data".concat(uri)).replace(/\/($|\?)/, '$1');
      },
      fetch: function fetch(query, params) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var mapResponse = options.filterResponse === false ? function (res) {
          return res;
        } : function (res) {
          return res.result;
        };

        var observable = this._dataRequest('query', {
          query: query,
          params: params
        }, options).pipe(map$2(mapResponse));

        return this.isPromiseAPI() ? toPromise(observable) : observable;
      },
      getDocument: function getDocument(id) {
        var options = {
          uri: this.getDataUrl('doc', id),
          json: true
        };

        var observable = this._requestObservable(options).pipe(filter$2(isResponse), map$2(function (event) {
          return event.body.documents && event.body.documents[0];
        }));

        return this.isPromiseAPI() ? toPromise(observable) : observable;
      },
      getDocuments: function getDocuments(ids) {
        var options = {
          uri: this.getDataUrl('doc', ids.join(',')),
          json: true
        };

        var observable = this._requestObservable(options).pipe(filter$2(isResponse), map$2(function (event) {
          var indexed = indexBy(event.body.documents || [], function (doc) {
            return doc._id;
          });
          return ids.map(function (id) {
            return indexed[id] || null;
          });
        }));

        return this.isPromiseAPI() ? toPromise(observable) : observable;
      },
      create: function create(doc, options) {
        return this._create(doc, 'create', options);
      },
      createIfNotExists: function createIfNotExists(doc, options) {
        validators.requireDocumentId('createIfNotExists', doc);
        return this._create(doc, 'createIfNotExists', options);
      },
      createOrReplace: function createOrReplace(doc, options) {
        validators.requireDocumentId('createOrReplace', doc);
        return this._create(doc, 'createOrReplace', options);
      },
      patch: function patch$1(selector, operations) {
        return new patch(selector, operations, this);
      },
      delete: function _delete(selection, options) {
        return this.dataRequest('mutate', {
          mutations: [{
            delete: getSelection(selection)
          }]
        }, options);
      },
      mutate: function mutate(mutations, options) {
        var mut = mutations instanceof patch || mutations instanceof transaction ? mutations.serialize() : mutations;
        var muts = Array.isArray(mut) ? mut : [mut];
        var transactionId = options && options.transactionId;
        return this.dataRequest('mutate', {
          mutations: muts,
          transactionId: transactionId
        }, options);
      },
      transaction: function transaction$1(operations) {
        return new transaction(operations, this);
      },
      dataRequest: function dataRequest(endpoint, body) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var request = this._dataRequest(endpoint, body, options);

        return this.isPromiseAPI() ? toPromise(request) : request;
      },
      _dataRequest: function _dataRequest(endpoint, body) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var isMutation = endpoint === 'mutate'; // Check if the query string is within a configured threshold,
        // in which case we can use GET. Otherwise, use POST.

        var strQuery = !isMutation && encodeQueryString(body);
        var useGet = !isMutation && strQuery.length < getQuerySizeLimit;
        var stringQuery = useGet ? strQuery : '';
        var returnFirst = options.returnFirst;
        var timeout = options.timeout,
            token = options.token;
        var uri = this.getDataUrl(endpoint, stringQuery);
        var reqOptions = {
          method: useGet ? 'GET' : 'POST',
          uri: uri,
          json: true,
          body: useGet ? undefined : body,
          query: isMutation && getMutationQuery(options),
          timeout: timeout,
          token: token
        };
        return this._requestObservable(reqOptions).pipe(filter$2(isResponse), map$2(getBody), map$2(function (res) {
          if (!isMutation) {
            return res;
          } // Should we return documents?


          var results = res.results || [];

          if (options.returnDocuments) {
            return returnFirst ? results[0] && results[0].document : results.map(function (mut) {
              return mut.document;
            });
          } // Return a reduced subset


          var key = returnFirst ? 'documentId' : 'documentIds';
          var ids = returnFirst ? results[0] && results[0].id : results.map(function (mut) {
            return mut.id;
          });
          return _defineProperty$2({
            transactionId: res.transactionId,
            results: results
          }, key, ids);
        }));
      },
      _create: function _create(doc, op) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var mutation = _defineProperty$2({}, op, doc);

        var opts = objectAssign({
          returnFirst: true,
          returnDocuments: true
        }, options);
        return this.dataRequest('mutate', {
          mutations: [mutation]
        }, opts);
      }
    };

    function DatasetsClient(client) {
      this.request = client.request.bind(client);
    }

    objectAssign(DatasetsClient.prototype, {
      create: function create(name, options) {
        return this._modify('PUT', name, options);
      },
      edit: function edit(name, options) {
        return this._modify('PATCH', name, options);
      },
      delete: function _delete(name) {
        return this._modify('DELETE', name);
      },
      list: function list() {
        return this.request({
          uri: '/datasets'
        });
      },
      _modify: function _modify(method, name, body) {
        validators.dataset(name);
        return this.request({
          method: method,
          uri: "/datasets/".concat(name),
          body: body
        });
      }
    });
    var datasetsClient = DatasetsClient;

    function ProjectsClient(client) {
      this.client = client;
    }

    objectAssign(ProjectsClient.prototype, {
      list: function list() {
        return this.client.request({
          uri: '/projects'
        });
      },
      getById: function getById(id) {
        return this.client.request({
          uri: "/projects/".concat(id)
        });
      }
    });
    var projectsClient = ProjectsClient;

    var queryString = function (params) {
      var qs = [];

      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          qs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key])));
        }
      }

      return qs.length > 0 ? "?".concat(qs.join('&')) : '';
    };

    function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

    function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

    function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



    var map$3 = map.map;

    var filter$3 = filter.filter;





    function AssetsClient(client) {
      this.client = client;
    }

    function toDocument(body) {
      // todo: rewrite to just return body.document in a while
      var document = body.document;
      Object.defineProperty(document, 'document', {
        enumerable: false,
        get: function get() {
          // eslint-disable-next-line no-console
          console.warn('The promise returned from client.asset.upload(...) now resolves with the asset document');
          return document;
        }
      });
      return document;
    }

    function optionsFromFile(opts, file) {
      if (typeof window === 'undefined' || !(file instanceof window.File)) {
        return opts;
      }

      return objectAssign({
        filename: opts.preserveFilename === false ? undefined : file.name,
        contentType: file.type
      }, opts);
    }

    objectAssign(AssetsClient.prototype, {
      /**
       * Upload an asset
       *
       * @param  {String} assetType `image` or `file`
       * @param  {File|Blob|Buffer|ReadableStream} body File to upload
       * @param  {Object}  opts Options for the upload
       * @param  {Boolean} opts.preserveFilename Whether or not to preserve the original filename (default: true)
       * @param  {String}  opts.filename Filename for this file (optional)
       * @param  {Number}  opts.timeout  Milliseconds to wait before timing the request out (default: 0)
       * @param  {String}  opts.contentType Mime type of the file
       * @param  {Array}   opts.extract Array of metadata parts to extract from image.
       *                                 Possible values: `location`, `exif`, `image`, `palette`
       * @param  {String}  opts.label Label
       * @param  {String}  opts.title Title
       * @param  {String}  opts.description Description
       * @param  {String}  opts.creditLine The credit to person(s) and/or organization(s) required by the supplier of the image to be used when published
       * @param  {Object}  opts.source Source data (when the asset is from an external service)
       * @param  {String}  opts.source.id The (u)id of the asset within the source, i.e. 'i-f323r1E'
       *                                  Required if source is defined
       * @param  {String}  opts.source.name The name of the source, i.e. 'unsplash'
       *                                  Required if source is defined
       * @param  {String}  opts.source.url A url to where to find the asset, or get more info about it in the source
       *                                  Optional
       * @return {Promise} Resolves with the created asset document
       */
      upload: function upload(assetType, body) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        validators.validateAssetType(assetType); // If an empty array is given, explicitly set `none` to override API defaults

        var meta = opts.extract || undefined;

        if (meta && !meta.length) {
          meta = ['none'];
        }

        var dataset = validators.hasDataset(this.client.clientConfig);
        var assetEndpoint = assetType === 'image' ? 'images' : 'files';
        var options = optionsFromFile(opts, body);
        var label = options.label,
            title = options.title,
            description = options.description,
            creditLine = options.creditLine,
            filename = options.filename,
            source = options.source;
        var query = {
          label: label,
          title: title,
          description: description,
          filename: filename,
          meta: meta,
          creditLine: creditLine
        };

        if (source) {
          query.sourceId = source.id;
          query.sourceName = source.name;
          query.sourceUrl = source.url;
        }

        var observable = this.client._requestObservable({
          method: 'POST',
          timeout: options.timeout || 0,
          uri: "/assets/".concat(assetEndpoint, "/").concat(dataset),
          headers: options.contentType ? {
            'Content-Type': options.contentType
          } : {},
          query: query,
          body: body
        });

        return this.client.isPromiseAPI() ? observable.pipe(filter$3(function (event) {
          return event.type === 'response';
        }), map$3(function (event) {
          return toDocument(event.body);
        })).toPromise() : observable;
      },
      delete: function _delete(type, id) {
        // eslint-disable-next-line no-console
        console.warn('client.assets.delete() is deprecated, please use client.delete(<document-id>)');
        var docId = id || '';

        if (!/^(image|file)-/.test(docId)) {
          docId = "".concat(type, "-").concat(docId);
        } else if (type._id) {
          // We could be passing an entire asset document instead of an ID
          docId = type._id;
        }

        validators.hasDataset(this.client.clientConfig);
        return this.client.delete(docId);
      },
      getImageUrl: function getImageUrl(ref, query) {
        var id = ref._ref || ref;

        if (typeof id !== 'string') {
          throw new Error('getImageUrl() needs either an object with a _ref, or a string with an asset document ID');
        }

        if (!/^image-[A-Za-z0-9_]+-\d+x\d+-[a-z]{1,5}$/.test(id)) {
          throw new Error("Unsupported asset ID \"".concat(id, "\". URL generation only works for auto-generated IDs."));
        }

        var _id$split = id.split('-'),
            _id$split2 = _slicedToArray(_id$split, 4),
            assetId = _id$split2[1],
            size = _id$split2[2],
            format = _id$split2[3];

        validators.hasDataset(this.client.clientConfig);
        var _this$client$clientCo = this.client.clientConfig,
            projectId = _this$client$clientCo.projectId,
            dataset = _this$client$clientCo.dataset;
        var qs = query ? queryString(query) : '';
        return "https://cdn.sanity.io/images/".concat(projectId, "/").concat(dataset, "/").concat(assetId, "-").concat(size, ".").concat(format).concat(qs);
      }
    });
    var assetsClient = AssetsClient;

    function UsersClient(client) {
      this.client = client;
    }

    objectAssign(UsersClient.prototype, {
      getById: function getById(id) {
        return this.client.request({
          uri: "/users/".concat(id)
        });
      }
    });
    var usersClient = UsersClient;

    function AuthClient(client) {
      this.client = client;
    }

    objectAssign(AuthClient.prototype, {
      getLoginProviders: function getLoginProviders() {
        return this.client.request({
          uri: '/auth/providers'
        });
      },
      logout: function logout() {
        return this.client.request({
          uri: '/auth/logout',
          method: 'POST'
        });
      }
    });
    var authClient = AuthClient;

    var nanoPubsub = function Pubsub() {
      var subscribers = [];
      return {
        subscribe: subscribe,
        publish: publish
      }
      function subscribe(subscriber) {
        subscribers.push(subscriber);
        return function unsubscribe() {
          var idx = subscribers.indexOf(subscriber);
          if (idx > -1) {
            subscribers.splice(idx, 1);
          }
        }
      }
      function publish() {
        for (var i = 0; i < subscribers.length; i++) {
          subscribers[i].apply(null, arguments);
        }
      }
    };

    var middlewareReducer = function (middleware) {
      var applyMiddleware = function applyMiddleware(hook, defaultValue) {
        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        var bailEarly = hook === 'onError';

        var value = defaultValue;
        for (var i = 0; i < middleware[hook].length; i++) {
          var handler = middleware[hook][i];
          value = handler.apply(undefined, [value].concat(args));

          if (bailEarly && !value) {
            break;
          }
        }

        return value;
      };

      return applyMiddleware;
    };

    /**
     * Check if we're required to add a port number.
     *
     * @see https://url.spec.whatwg.org/#default-port
     * @param {Number|String} port Port number we need to check
     * @param {String} protocol Protocol we need to check against.
     * @returns {Boolean} Is it a default port for the given protocol
     * @api private
     */
    var requiresPort = function required(port, protocol) {
      protocol = protocol.split(':')[0];
      port = +port;

      if (!port) return false;

      switch (protocol) {
        case 'http':
        case 'ws':
        return port !== 80;

        case 'https':
        case 'wss':
        return port !== 443;

        case 'ftp':
        return port !== 21;

        case 'gopher':
        return port !== 70;

        case 'file':
        return false;
      }

      return port !== 0;
    };

    var has = Object.prototype.hasOwnProperty
      , undef;

    /**
     * Decode a URI encoded string.
     *
     * @param {String} input The URI encoded string.
     * @returns {String|Null} The decoded string.
     * @api private
     */
    function decode(input) {
      try {
        return decodeURIComponent(input.replace(/\+/g, ' '));
      } catch (e) {
        return null;
      }
    }

    /**
     * Attempts to encode a given input.
     *
     * @param {String} input The string that needs to be encoded.
     * @returns {String|Null} The encoded string.
     * @api private
     */
    function encode(input) {
      try {
        return encodeURIComponent(input);
      } catch (e) {
        return null;
      }
    }

    /**
     * Simple query string parser.
     *
     * @param {String} query The query string that needs to be parsed.
     * @returns {Object}
     * @api public
     */
    function querystring(query) {
      var parser = /([^=?#&]+)=?([^&]*)/g
        , result = {}
        , part;

      while (part = parser.exec(query)) {
        var key = decode(part[1])
          , value = decode(part[2]);

        //
        // Prevent overriding of existing properties. This ensures that build-in
        // methods like `toString` or __proto__ are not overriden by malicious
        // querystrings.
        //
        // In the case if failed decoding, we want to omit the key/value pairs
        // from the result.
        //
        if (key === null || value === null || key in result) continue;
        result[key] = value;
      }

      return result;
    }

    /**
     * Transform a query string to an object.
     *
     * @param {Object} obj Object that should be transformed.
     * @param {String} prefix Optional prefix.
     * @returns {String}
     * @api public
     */
    function querystringify(obj, prefix) {
      prefix = prefix || '';

      var pairs = []
        , value
        , key;

      //
      // Optionally prefix with a '?' if needed
      //
      if ('string' !== typeof prefix) prefix = '?';

      for (key in obj) {
        if (has.call(obj, key)) {
          value = obj[key];

          //
          // Edge cases where we actually want to encode the value to an empty
          // string instead of the stringified value.
          //
          if (!value && (value === null || value === undef || isNaN(value))) {
            value = '';
          }

          key = encode(key);
          value = encode(value);

          //
          // If we failed to encode the strings, we should bail out as we don't
          // want to add invalid strings to the query.
          //
          if (key === null || value === null) continue;
          pairs.push(key +'='+ value);
        }
      }

      return pairs.length ? prefix + pairs.join('&') : '';
    }

    //
    // Expose the module.
    //
    var stringify = querystringify;
    var parse = querystring;

    var querystringify_1 = {
    	stringify: stringify,
    	parse: parse
    };

    var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
      , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
      , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
      , left = new RegExp('^'+ whitespace +'+');

    /**
     * Trim a given string.
     *
     * @param {String} str String to trim.
     * @public
     */
    function trimLeft(str) {
      return (str ? str : '').toString().replace(left, '');
    }

    /**
     * These are the parse rules for the URL parser, it informs the parser
     * about:
     *
     * 0. The char it Needs to parse, if it's a string it should be done using
     *    indexOf, RegExp using exec and NaN means set as current value.
     * 1. The property we should set when parsing this value.
     * 2. Indication if it's backwards or forward parsing, when set as number it's
     *    the value of extra chars that should be split off.
     * 3. Inherit from location if non existing in the parser.
     * 4. `toLowerCase` the resulting value.
     */
    var rules = [
      ['#', 'hash'],                        // Extract from the back.
      ['?', 'query'],                       // Extract from the back.
      function sanitize(address) {          // Sanitize what is left of the address
        return address.replace('\\', '/');
      },
      ['/', 'pathname'],                    // Extract from the back.
      ['@', 'auth', 1],                     // Extract from the front.
      [NaN, 'host', undefined, 1, 1],       // Set left over value.
      [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
      [NaN, 'hostname', undefined, 1, 1]    // Set left over.
    ];

    /**
     * These properties should not be copied or inherited from. This is only needed
     * for all non blob URL's as a blob URL does not include a hash, only the
     * origin.
     *
     * @type {Object}
     * @private
     */
    var ignore = { hash: 1, query: 1 };

    /**
     * The location object differs when your code is loaded through a normal page,
     * Worker or through a worker using a blob. And with the blobble begins the
     * trouble as the location object will contain the URL of the blob, not the
     * location of the page where our code is loaded in. The actual origin is
     * encoded in the `pathname` so we can thankfully generate a good "default"
     * location from it so we can generate proper relative URL's again.
     *
     * @param {Object|String} loc Optional default location object.
     * @returns {Object} lolcation object.
     * @public
     */
    function lolcation(loc) {
      var globalVar;

      if (typeof window !== 'undefined') globalVar = window;
      else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
      else if (typeof self !== 'undefined') globalVar = self;
      else globalVar = {};

      var location = globalVar.location || {};
      loc = loc || location;

      var finaldestination = {}
        , type = typeof loc
        , key;

      if ('blob:' === loc.protocol) {
        finaldestination = new Url(unescape(loc.pathname), {});
      } else if ('string' === type) {
        finaldestination = new Url(loc, {});
        for (key in ignore) delete finaldestination[key];
      } else if ('object' === type) {
        for (key in loc) {
          if (key in ignore) continue;
          finaldestination[key] = loc[key];
        }

        if (finaldestination.slashes === undefined) {
          finaldestination.slashes = slashes.test(loc.href);
        }
      }

      return finaldestination;
    }

    /**
     * @typedef ProtocolExtract
     * @type Object
     * @property {String} protocol Protocol matched in the URL, in lowercase.
     * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
     * @property {String} rest Rest of the URL that is not part of the protocol.
     */

    /**
     * Extract protocol information from a URL with/without double slash ("//").
     *
     * @param {String} address URL we want to extract from.
     * @return {ProtocolExtract} Extracted information.
     * @private
     */
    function extractProtocol(address) {
      address = trimLeft(address);
      var match = protocolre.exec(address);

      return {
        protocol: match[1] ? match[1].toLowerCase() : '',
        slashes: !!match[2],
        rest: match[3]
      };
    }

    /**
     * Resolve a relative URL pathname against a base URL pathname.
     *
     * @param {String} relative Pathname of the relative URL.
     * @param {String} base Pathname of the base URL.
     * @return {String} Resolved pathname.
     * @private
     */
    function resolve(relative, base) {
      if (relative === '') return base;

      var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
        , i = path.length
        , last = path[i - 1]
        , unshift = false
        , up = 0;

      while (i--) {
        if (path[i] === '.') {
          path.splice(i, 1);
        } else if (path[i] === '..') {
          path.splice(i, 1);
          up++;
        } else if (up) {
          if (i === 0) unshift = true;
          path.splice(i, 1);
          up--;
        }
      }

      if (unshift) path.unshift('');
      if (last === '.' || last === '..') path.push('');

      return path.join('/');
    }

    /**
     * The actual URL instance. Instead of returning an object we've opted-in to
     * create an actual constructor as it's much more memory efficient and
     * faster and it pleases my OCD.
     *
     * It is worth noting that we should not use `URL` as class name to prevent
     * clashes with the global URL instance that got introduced in browsers.
     *
     * @constructor
     * @param {String} address URL we want to parse.
     * @param {Object|String} [location] Location defaults for relative paths.
     * @param {Boolean|Function} [parser] Parser for the query string.
     * @private
     */
    function Url(address, location, parser) {
      address = trimLeft(address);

      if (!(this instanceof Url)) {
        return new Url(address, location, parser);
      }

      var relative, extracted, parse, instruction, index, key
        , instructions = rules.slice()
        , type = typeof location
        , url = this
        , i = 0;

      //
      // The following if statements allows this module two have compatibility with
      // 2 different API:
      //
      // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
      //    where the boolean indicates that the query string should also be parsed.
      //
      // 2. The `URL` interface of the browser which accepts a URL, object as
      //    arguments. The supplied object will be used as default values / fall-back
      //    for relative paths.
      //
      if ('object' !== type && 'string' !== type) {
        parser = location;
        location = null;
      }

      if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

      location = lolcation(location);

      //
      // Extract protocol information before running the instructions.
      //
      extracted = extractProtocol(address || '');
      relative = !extracted.protocol && !extracted.slashes;
      url.slashes = extracted.slashes || relative && location.slashes;
      url.protocol = extracted.protocol || location.protocol || '';
      address = extracted.rest;

      //
      // When the authority component is absent the URL starts with a path
      // component.
      //
      if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

      for (; i < instructions.length; i++) {
        instruction = instructions[i];

        if (typeof instruction === 'function') {
          address = instruction(address);
          continue;
        }

        parse = instruction[0];
        key = instruction[1];

        if (parse !== parse) {
          url[key] = address;
        } else if ('string' === typeof parse) {
          if (~(index = address.indexOf(parse))) {
            if ('number' === typeof instruction[2]) {
              url[key] = address.slice(0, index);
              address = address.slice(index + instruction[2]);
            } else {
              url[key] = address.slice(index);
              address = address.slice(0, index);
            }
          }
        } else if ((index = parse.exec(address))) {
          url[key] = index[1];
          address = address.slice(0, index.index);
        }

        url[key] = url[key] || (
          relative && instruction[3] ? location[key] || '' : ''
        );

        //
        // Hostname, host and protocol should be lowercased so they can be used to
        // create a proper `origin`.
        //
        if (instruction[4]) url[key] = url[key].toLowerCase();
      }

      //
      // Also parse the supplied query string in to an object. If we're supplied
      // with a custom parser as function use that instead of the default build-in
      // parser.
      //
      if (parser) url.query = parser(url.query);

      //
      // If the URL is relative, resolve the pathname against the base URL.
      //
      if (
          relative
        && location.slashes
        && url.pathname.charAt(0) !== '/'
        && (url.pathname !== '' || location.pathname !== '')
      ) {
        url.pathname = resolve(url.pathname, location.pathname);
      }

      //
      // We should not add port numbers if they are already the default port number
      // for a given protocol. As the host also contains the port number we're going
      // override it with the hostname which contains no port number.
      //
      if (!requiresPort(url.port, url.protocol)) {
        url.host = url.hostname;
        url.port = '';
      }

      //
      // Parse down the `auth` for the username and password.
      //
      url.username = url.password = '';
      if (url.auth) {
        instruction = url.auth.split(':');
        url.username = instruction[0] || '';
        url.password = instruction[1] || '';
      }

      url.origin = url.protocol && url.host && url.protocol !== 'file:'
        ? url.protocol +'//'+ url.host
        : 'null';

      //
      // The href is just the compiled result.
      //
      url.href = url.toString();
    }

    /**
     * This is convenience method for changing properties in the URL instance to
     * insure that they all propagate correctly.
     *
     * @param {String} part          Property we need to adjust.
     * @param {Mixed} value          The newly assigned value.
     * @param {Boolean|Function} fn  When setting the query, it will be the function
     *                               used to parse the query.
     *                               When setting the protocol, double slash will be
     *                               removed from the final url if it is true.
     * @returns {URL} URL instance for chaining.
     * @public
     */
    function set(part, value, fn) {
      var url = this;

      switch (part) {
        case 'query':
          if ('string' === typeof value && value.length) {
            value = (fn || querystringify_1.parse)(value);
          }

          url[part] = value;
          break;

        case 'port':
          url[part] = value;

          if (!requiresPort(value, url.protocol)) {
            url.host = url.hostname;
            url[part] = '';
          } else if (value) {
            url.host = url.hostname +':'+ value;
          }

          break;

        case 'hostname':
          url[part] = value;

          if (url.port) value += ':'+ url.port;
          url.host = value;
          break;

        case 'host':
          url[part] = value;

          if (/:\d+$/.test(value)) {
            value = value.split(':');
            url.port = value.pop();
            url.hostname = value.join(':');
          } else {
            url.hostname = value;
            url.port = '';
          }

          break;

        case 'protocol':
          url.protocol = value.toLowerCase();
          url.slashes = !fn;
          break;

        case 'pathname':
        case 'hash':
          if (value) {
            var char = part === 'pathname' ? '/' : '#';
            url[part] = value.charAt(0) !== char ? char + value : value;
          } else {
            url[part] = value;
          }
          break;

        default:
          url[part] = value;
      }

      for (var i = 0; i < rules.length; i++) {
        var ins = rules[i];

        if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
      }

      url.origin = url.protocol && url.host && url.protocol !== 'file:'
        ? url.protocol +'//'+ url.host
        : 'null';

      url.href = url.toString();

      return url;
    }

    /**
     * Transform the properties back in to a valid and full URL string.
     *
     * @param {Function} stringify Optional query stringify function.
     * @returns {String} Compiled version of the URL.
     * @public
     */
    function toString(stringify) {
      if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

      var query
        , url = this
        , protocol = url.protocol;

      if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

      var result = protocol + (url.slashes ? '//' : '');

      if (url.username) {
        result += url.username;
        if (url.password) result += ':'+ url.password;
        result += '@';
      }

      result += url.host + url.pathname;

      query = 'object' === typeof url.query ? stringify(url.query) : url.query;
      if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

      if (url.hash) result += url.hash;

      return result;
    }

    Url.prototype = { set: set, toString: toString };

    //
    // Expose the URL parser and some additional properties that might be useful for
    // others or testing.
    //
    Url.extractProtocol = extractProtocol;
    Url.location = lolcation;
    Url.trimLeft = trimLeft;
    Url.qs = querystringify_1;

    var urlParse = Url;

    var isReactNative = typeof navigator === 'undefined' ? false : navigator.product === 'ReactNative';

    var has$1 = Object.prototype.hasOwnProperty;
    var defaultOptions$1 = { timeout: isReactNative ? 60000 : 120000 };

    var defaultOptionsProcessor = function (opts) {
      var options = typeof opts === 'string' ? objectAssign({ url: opts }, defaultOptions$1) : objectAssign({}, defaultOptions$1, opts);

      // Parse URL into parts
      var url = urlParse(options.url, {}, // Don't use current browser location
      true // Parse query strings
      );

      // Normalize timeouts
      options.timeout = normalizeTimeout(options.timeout);

      // Shallow-merge (override) existing query params
      if (options.query) {
        url.query = objectAssign({}, url.query, removeUndefined(options.query));
      }

      // Implicit POST if we have not specified a method but have a body
      options.method = options.body && !options.method ? 'POST' : (options.method || 'GET').toUpperCase();

      // Stringify URL
      options.url = url.toString(stringifyQueryString);

      return options;
    };

    function stringifyQueryString(obj) {
      var pairs = [];
      for (var key in obj) {
        if (has$1.call(obj, key)) {
          push(key, obj[key]);
        }
      }

      return pairs.length ? pairs.join('&') : '';

      function push(key, val) {
        if (Array.isArray(val)) {
          val.forEach(function (item) {
            return push(key, item);
          });
        } else {
          pairs.push([key, val].map(encodeURIComponent).join('='));
        }
      }
    }

    function normalizeTimeout(time) {
      if (time === false || time === 0) {
        return false;
      }

      if (time.connect || time.socket) {
        return time;
      }

      var delay = Number(time);
      if (isNaN(delay)) {
        return normalizeTimeout(defaultOptions$1.timeout);
      }

      return { connect: delay, socket: delay };
    }

    function removeUndefined(obj) {
      var target = {};
      for (var key in obj) {
        if (obj[key] !== undefined) {
          target[key] = obj[key];
        }
      }
      return target;
    }

    var validUrl = /^https?:\/\//i;

    var defaultOptionsValidator = function (options) {
      if (!validUrl.test(options.url)) {
        throw new Error("\"" + options.url + "\" is not a valid URL");
      }
    };

    /**
     * This file is only used for the browser version of `same-origin`.
     * Used to bring down the size of the browser bundle.
     */

    var regex = /^(?:(?:(?:([^:\/#\?]+:)?(?:(?:\/\/)((?:((?:[^:@\/#\?]+)(?:\:(?:[^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((?:\/?(?:[^\/\?#]+\/+)*)(?:[^\?#]*)))?(\?[^#]+)?)(#.*)?/;

    var urlParser = {
        regex: regex,
        parse: function(url) {
            var match = regex.exec(url);
            if (!match) {
                return {};
            }

            return {
                protocol: (match[1] || '').toLowerCase() || undefined,
                hostname: (match[5] || '').toLowerCase() || undefined,
                port: match[6] || undefined
            };
        }
    };

    var sameOrigin = function(uri1, uri2, ieMode) {
        if (uri1 === uri2) {
            return true;
        }

        var url1 = urlParser.parse(uri1, false, true);
        var url2 = urlParser.parse(uri2, false, true);

        var url1Port = url1.port|0 || (url1.protocol === 'https' ? 443 : 80);
        var url2Port = url2.port|0 || (url2.protocol === 'https' ? 443 : 80);

        var match = {
            proto: url1.protocol === url2.protocol,
            hostname: url1.hostname === url2.hostname,
            port: url1Port === url2Port
        };

        return ((match.proto && match.hostname) && (match.port || ieMode));
    };

    var trim = function(string) {
      return string.replace(/^\s+|\s+$/g, '');
    }
      , isArray$1 = function(arg) {
          return Object.prototype.toString.call(arg) === '[object Array]';
        };

    var parseHeaders = function (headers) {
      if (!headers)
        return {}

      var result = {};

      var headersArr = trim(headers).split('\n');

      for (var i = 0; i < headersArr.length; i++) {
        var row = headersArr[i];
        var index = row.indexOf(':')
        , key = trim(row.slice(0, index)).toLowerCase()
        , value = trim(row.slice(index + 1));

        if (typeof(result[key]) === 'undefined') {
          result[key] = value;
        } else if (isArray$1(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [ result[key], value ];
        }
      }

      return result
    };

    /* eslint max-depth: ["error", 4] */


    var noop$1 = function noop() {
      /* intentional noop */
    };

    var win = window;
    var XmlHttpRequest = win.XMLHttpRequest || noop$1;
    var hasXhr2 = 'withCredentials' in new XmlHttpRequest();
    var XDomainRequest$1 = hasXhr2 ? XmlHttpRequest : win.XDomainRequest;
    var adapter = 'xhr';

    var browserRequest = function (context, callback) {
      var opts = context.options;
      var options = context.applyMiddleware('finalizeOptions', opts);
      var timers = {};

      // Deep-checking window.location because of react native, where `location` doesn't exist
      var cors = win && win.location && !sameOrigin(win.location.href, options.url);

      // Allow middleware to inject a response, for instance in the case of caching or mocking
      var injectedResponse = context.applyMiddleware('interceptRequest', undefined, {
        adapter: adapter,
        context: context
      });

      // If middleware injected a response, treat it as we normally would and return it
      // Do note that the injected response has to be reduced to a cross-environment friendly response
      if (injectedResponse) {
        var cbTimer = setTimeout(callback, 0, null, injectedResponse);
        var cancel = function cancel() {
          return clearTimeout(cbTimer);
        };
        return { abort: cancel };
      }

      // We'll want to null out the request on success/failure
      var xhr = cors ? new XDomainRequest$1() : new XmlHttpRequest();

      var isXdr = win.XDomainRequest && xhr instanceof win.XDomainRequest;
      var headers = options.headers;

      // Request state
      var aborted = false;
      var loaded = false;
      var timedOut = false;

      // Apply event handlers
      xhr.onerror = onError;
      xhr.ontimeout = onError;
      xhr.onabort = function () {
        aborted = true;
      };

      // IE9 must have onprogress be set to a unique function
      xhr.onprogress = function () {
        /* intentional noop */
      };

      var loadEvent = isXdr ? 'onload' : 'onreadystatechange';
      xhr[loadEvent] = function () {
        // Prevent request from timing out
        resetTimers();

        if (aborted || xhr.readyState !== 4 && !isXdr) {
          return;
        }

        // Will be handled by onError
        if (xhr.status === 0) {
          return;
        }

        onLoad();
      };

      // @todo two last options to open() is username/password
      xhr.open(options.method, options.url, true // Always async
      );

      // Some options need to be applied after open
      xhr.withCredentials = !!options.withCredentials;

      // Set headers
      if (headers && xhr.setRequestHeader) {
        for (var key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
          }
        }
      } else if (headers && isXdr) {
        throw new Error('Headers cannot be set on an XDomainRequest object');
      }

      if (options.rawBody) {
        xhr.responseType = 'arraybuffer';
      }

      // Let middleware know we're about to do a request
      context.applyMiddleware('onRequest', { options: options, adapter: adapter, request: xhr, context: context });

      xhr.send(options.body || null);

      // Figure out which timeouts to use (if any)
      var delays = options.timeout;
      if (delays) {
        timers.connect = setTimeout(function () {
          return timeoutRequest('ETIMEDOUT');
        }, delays.connect);
      }

      return { abort: abort };

      function abort() {
        aborted = true;

        if (xhr) {
          xhr.abort();
        }
      }

      function timeoutRequest(code) {
        timedOut = true;
        xhr.abort();
        var error = new Error(code === 'ESOCKETTIMEDOUT' ? 'Socket timed out on request to ' + options.url : 'Connection timed out on request to ' + options.url);
        error.code = code;
        context.channels.error.publish(error);
      }

      function resetTimers() {
        if (!delays) {
          return;
        }

        stopTimers();
        timers.socket = setTimeout(function () {
          return timeoutRequest('ESOCKETTIMEDOUT');
        }, delays.socket);
      }

      function stopTimers() {
        // Only clear the connect timeout if we've got a connection
        if (aborted || xhr.readyState >= 2 && timers.connect) {
          clearTimeout(timers.connect);
        }

        if (timers.socket) {
          clearTimeout(timers.socket);
        }
      }

      function onError() {
        if (loaded) {
          return;
        }

        // Clean up
        stopTimers();
        loaded = true;
        xhr = null;

        // Annoyingly, details are extremely scarce and hidden from us.
        // We only really know that it is a network error
        var err = new Error('Network error while attempting to reach ' + options.url);
        err.isNetworkError = true;
        err.request = options;
        callback(err);
      }

      function reduceResponse() {
        var statusCode = xhr.status;
        var statusMessage = xhr.statusText;

        if (isXdr && statusCode === undefined) {
          // IE8 CORS GET successful response doesn't have a status field, but body is fine
          statusCode = 200;
        } else if (statusCode > 12000 && statusCode < 12156) {
          // Yet another IE quirk where it emits weird status codes on network errors
          // https://support.microsoft.com/en-us/kb/193625
          return onError();
        } else {
          // Another IE bug where HTTP 204 somehow ends up as 1223
          statusCode = xhr.status === 1223 ? 204 : xhr.status;
          statusMessage = xhr.status === 1223 ? 'No Content' : statusMessage;
        }

        return {
          body: xhr.response || xhr.responseText,
          url: options.url,
          method: options.method,
          headers: isXdr ? {} : parseHeaders(xhr.getAllResponseHeaders()),
          statusCode: statusCode,
          statusMessage: statusMessage
        };
      }

      function onLoad() {
        if (aborted || loaded || timedOut) {
          return;
        }

        if (xhr.status === 0) {
          onError();
          return;
        }

        // Prevent being called twice
        stopTimers();
        loaded = true;
        callback(null, reduceResponse());
      }
    };

    var request = browserRequest;

    // node-request in node, browser-request in browsers

    var channelNames = ['request', 'response', 'progress', 'error', 'abort'];
    var middlehooks = ['processOptions', 'validateOptions', 'interceptRequest', 'finalizeOptions', 'onRequest', 'onResponse', 'onError', 'onReturn', 'onHeaders'];

    var lib = function createRequester() {
      var initMiddleware = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var loadedMiddleware = [];
      var middleware = middlehooks.reduce(function (ware, name) {
        ware[name] = ware[name] || [];
        return ware;
      }, {
        processOptions: [defaultOptionsProcessor],
        validateOptions: [defaultOptionsValidator]
      });

      function request$1(opts) {
        var channels = channelNames.reduce(function (target, name) {
          target[name] = nanoPubsub();
          return target;
        }, {});

        // Prepare a middleware reducer that can be reused throughout the lifecycle
        var applyMiddleware = middlewareReducer(middleware);

        // Parse the passed options
        var options = applyMiddleware('processOptions', opts);

        // Validate the options
        applyMiddleware('validateOptions', options);

        // Build a context object we can pass to child handlers
        var context = { options: options, channels: channels, applyMiddleware: applyMiddleware

          // We need to hold a reference to the current, ongoing request,
          // in order to allow cancellation. In the case of the retry middleware,
          // a new request might be triggered
        };var ongoingRequest = null;
        var unsubscribe = channels.request.subscribe(function (ctx) {
          // Let request adapters (node/browser) perform the actual request
          ongoingRequest = request(ctx, function (err, res) {
            return onResponse(err, res, ctx);
          });
        });

        // If we abort the request, prevent further requests from happening,
        // and be sure to cancel any ongoing request (obviously)
        channels.abort.subscribe(function () {
          unsubscribe();
          if (ongoingRequest) {
            ongoingRequest.abort();
          }
        });

        // See if any middleware wants to modify the return value - for instance
        // the promise or observable middlewares
        var returnValue = applyMiddleware('onReturn', channels, context);

        // If return value has been modified by a middleware, we expect the middleware
        // to publish on the 'request' channel. If it hasn't been modified, we want to
        // trigger it right away
        if (returnValue === channels) {
          channels.request.publish(context);
        }

        return returnValue;

        function onResponse(reqErr, res, ctx) {
          var error = reqErr;
          var response = res;

          // We're processing non-errors first, in case a middleware converts the
          // response into an error (for instance, status >= 400 == HttpError)
          if (!error) {
            try {
              response = applyMiddleware('onResponse', res, ctx);
            } catch (err) {
              response = null;
              error = err;
            }
          }

          // Apply error middleware - if middleware return the same (or a different) error,
          // publish as an error event. If we *don't* return an error, assume it has been handled
          error = error && applyMiddleware('onError', error, ctx);

          // Figure out if we should publish on error/response channels
          if (error) {
            channels.error.publish(error);
          } else if (response) {
            channels.response.publish(response);
          }
        }
      }

      request$1.use = function use(newMiddleware) {
        if (!newMiddleware) {
          throw new Error('Tried to add middleware that resolved to falsey value');
        }

        if (typeof newMiddleware === 'function') {
          throw new Error('Tried to add middleware that was a function. It probably expects you to pass options to it.');
        }

        if (newMiddleware.onReturn && middleware.onReturn.length > 0) {
          throw new Error('Tried to add new middleware with `onReturn` handler, but another handler has already been registered for this event');
        }

        middlehooks.forEach(function (key) {
          if (newMiddleware[key]) {
            middleware[key].push(newMiddleware[key]);
          }
        });

        loadedMiddleware.push(newMiddleware);
        return request$1;
      };

      request$1.clone = function clone() {
        return createRequester(loadedMiddleware);
      };

      initMiddleware.forEach(request$1.use);

      return request$1;
    };

    var getIt = lib;

    var global_1 = createCommonjsModule(function (module) {

    /* eslint-disable no-negated-condition */
    if (typeof window !== 'undefined') {
      module.exports = window;
    } else if (typeof commonjsGlobal !== 'undefined') {
      module.exports = commonjsGlobal;
    } else if (typeof self !== 'undefined') {
      module.exports = self;
    } else {
      module.exports = {};
    }

    });

    var observable$1 = function () {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var Observable = opts.implementation || global_1.Observable;
      if (!Observable) {
        throw new Error('`Observable` is not available in global scope, and no implementation was passed');
      }

      return {
        onReturn: function onReturn(channels, context) {
          return new Observable(function (observer) {
            channels.error.subscribe(function (err) {
              return observer.error(err);
            });
            channels.progress.subscribe(function (event) {
              return observer.next(objectAssign({ type: 'progress' }, event));
            });
            channels.response.subscribe(function (response) {
              observer.next(objectAssign({ type: 'response' }, response));
              observer.complete();
            });

            channels.request.publish(context);
            return function () {
              return channels.abort.publish();
            };
          });
        }
      };
    };

    /*!
     * isobject <https://github.com/jonschlinkert/isobject>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    var isobject = function isObject(val) {
      return val != null && typeof val === 'object' && Array.isArray(val) === false;
    };

    function isObjectObject(o) {
      return isobject(o) === true
        && Object.prototype.toString.call(o) === '[object Object]';
    }

    var isPlainObject = function isPlainObject(o) {
      var ctor,prot;

      if (isObjectObject(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (typeof ctor !== 'function') return false;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObjectObject(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };




    var serializeTypes = ['boolean', 'string', 'number'];
    var isBuffer = function isBuffer(obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
    };

    var jsonRequest = function () {
      return {
        processOptions: function processOptions(options) {
          var body = options.body;
          if (!body) {
            return options;
          }

          var isStream = typeof body.pipe === 'function';
          var shouldSerialize = !isStream && !isBuffer(body) && (serializeTypes.indexOf(typeof body === 'undefined' ? 'undefined' : _typeof(body)) !== -1 || Array.isArray(body) || isPlainObject(body));

          if (!shouldSerialize) {
            return options;
          }

          return objectAssign({}, options, {
            body: JSON.stringify(options.body),
            headers: objectAssign({}, options.headers, {
              'Content-Type': 'application/json'
            })
          });
        }
      };
    };

    var jsonResponse = function (opts) {
      return {
        onResponse: function onResponse(response) {
          var contentType = response.headers['content-type'] || '';
          var shouldDecode = opts && opts.force || contentType.indexOf('application/json') !== -1;
          if (!response.body || !contentType || !shouldDecode) {
            return response;
          }

          return objectAssign({}, response, { body: tryParse(response.body) });
        },

        processOptions: function processOptions(options) {
          return objectAssign({}, options, {
            headers: objectAssign({ Accept: 'application/json' }, options.headers)
          });
        }
      };
    };

    function tryParse(body) {
      try {
        return JSON.parse(body);
      } catch (err) {
        err.message = 'Failed to parsed response body as JSON: ' + err.message;
        throw err;
      }
    }

    var browserProgress = function () {
      return {
        onRequest: function onRequest(evt) {
          if (evt.adapter !== 'xhr') {
            return;
          }

          var xhr = evt.request;
          var context = evt.context;

          if ('upload' in xhr && 'onprogress' in xhr.upload) {
            xhr.upload.onprogress = handleProgress('upload');
          }

          if ('onprogress' in xhr) {
            xhr.onprogress = handleProgress('download');
          }

          function handleProgress(stage) {
            return function (event) {
              var percent = event.lengthComputable ? event.loaded / event.total * 100 : -1;
              context.channels.progress.publish({
                stage: stage,
                percent: percent,
                total: event.total,
                loaded: event.loaded,
                lengthComputable: event.lengthComputable
              });
            };
          }
        }
      };
    };

    var progress = browserProgress;

    var makeError_1 = createCommonjsModule(function (module, exports) {

    // ===================================================================

    var construct = typeof Reflect !== "undefined" ? Reflect.construct : undefined;
    var defineProperty = Object.defineProperty;

    // -------------------------------------------------------------------

    var captureStackTrace = Error.captureStackTrace;
    if (captureStackTrace === undefined) {
      captureStackTrace = function captureStackTrace(error) {
        var container = new Error();

        defineProperty(error, "stack", {
          configurable: true,
          get: function getStack() {
            var stack = container.stack;

            // Replace property with value for faster future accesses.
            defineProperty(this, "stack", {
              configurable: true,
              value: stack,
              writable: true,
            });

            return stack;
          },
          set: function setStack(stack) {
            defineProperty(error, "stack", {
              configurable: true,
              value: stack,
              writable: true,
            });
          },
        });
      };
    }

    // -------------------------------------------------------------------

    function BaseError(message) {
      if (message !== undefined) {
        defineProperty(this, "message", {
          configurable: true,
          value: message,
          writable: true,
        });
      }

      var cname = this.constructor.name;
      if (cname !== undefined && cname !== this.name) {
        defineProperty(this, "name", {
          configurable: true,
          value: cname,
          writable: true,
        });
      }

      captureStackTrace(this, this.constructor);
    }

    BaseError.prototype = Object.create(Error.prototype, {
      // See: https://github.com/JsCommunity/make-error/issues/4
      constructor: {
        configurable: true,
        value: BaseError,
        writable: true,
      },
    });

    // -------------------------------------------------------------------

    // Sets the name of a function if possible (depends of the JS engine).
    var setFunctionName = (function() {
      function setFunctionName(fn, name) {
        return defineProperty(fn, "name", {
          configurable: true,
          value: name,
        });
      }
      try {
        var f = function() {};
        setFunctionName(f, "foo");
        if (f.name === "foo") {
          return setFunctionName;
        }
      } catch (_) {}
    })();

    // -------------------------------------------------------------------

    function makeError(constructor, super_) {
      if (super_ == null || super_ === Error) {
        super_ = BaseError;
      } else if (typeof super_ !== "function") {
        throw new TypeError("super_ should be a function");
      }

      var name;
      if (typeof constructor === "string") {
        name = constructor;
        constructor =
          construct !== undefined
            ? function() {
                return construct(super_, arguments, this.constructor);
              }
            : function() {
                super_.apply(this, arguments);
              };

        // If the name can be set, do it once and for all.
        if (setFunctionName !== undefined) {
          setFunctionName(constructor, name);
          name = undefined;
        }
      } else if (typeof constructor !== "function") {
        throw new TypeError("constructor should be either a string or a function");
      }

      // Also register the super constructor also as `constructor.super_` just
      // like Node's `util.inherits()`.
      //
      // eslint-disable-next-line dot-notation
      constructor.super_ = constructor["super"] = super_;

      var properties = {
        constructor: {
          configurable: true,
          value: constructor,
          writable: true,
        },
      };

      // If the name could not be set on the constructor, set it on the
      // prototype.
      if (name !== undefined) {
        properties.name = {
          configurable: true,
          value: name,
          writable: true,
        };
      }
      constructor.prototype = Object.create(super_.prototype, properties);

      return constructor;
    }
    exports = module.exports = makeError;
    exports.BaseError = BaseError;
    });

    function ClientError(res) {
      var props = extractErrorProps(res);
      ClientError.super.call(this, props.message);
      objectAssign(this, props);
    }

    function ServerError(res) {
      var props = extractErrorProps(res);
      ServerError.super.call(this, props.message);
      objectAssign(this, props);
    }

    function extractErrorProps(res) {
      var body = res.body;
      var props = {
        response: res,
        statusCode: res.statusCode,
        responseBody: stringifyBody(body, res)
      }; // API/Boom style errors ({statusCode, error, message})

      if (body.error && body.message) {
        props.message = "".concat(body.error, " - ").concat(body.message);
        return props;
      } // Query/database errors ({error: {description, other, arb, props}})


      if (body.error && body.error.description) {
        props.message = body.error.description;
        props.details = body.error;
        return props;
      } // Other, more arbitrary errors


      props.message = body.error || body.message || httpErrorMessage(res);
      return props;
    }

    function httpErrorMessage(res) {
      var statusMessage = res.statusMessage ? " ".concat(res.statusMessage) : '';
      return "".concat(res.method, "-request to ").concat(res.url, " resulted in HTTP ").concat(res.statusCode).concat(statusMessage);
    }

    function stringifyBody(body, res) {
      var contentType = (res.headers['content-type'] || '').toLowerCase();
      var isJson = contentType.indexOf('application/json') !== -1;
      return isJson ? JSON.stringify(body, null, 2) : body;
    }

    makeError_1(ClientError);
    makeError_1(ServerError);
    var ClientError_1 = ClientError;
    var ServerError_1 = ServerError;

    var errors = {
    	ClientError: ClientError_1,
    	ServerError: ServerError_1
    };

    var browserMiddleware = [];

    /* eslint-disable no-empty-function, no-process-env */














    var ClientError$1 = errors.ClientError,
        ServerError$1 = errors.ServerError;

    var httpError = {
      onResponse: function onResponse(res) {
        if (res.statusCode >= 500) {
          throw new ServerError$1(res);
        } else if (res.statusCode >= 400) {
          throw new ClientError$1(res);
        }

        return res;
      }
    }; // Environment-specific middleware.



    var middleware = browserMiddleware.concat([jsonRequest(), jsonResponse(), progress(), httpError, observable$1({
      implementation: minimal
    })]);
    var request$1 = getIt(middleware);

    function httpRequest(options) {
      var requester = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : request$1;
      return requester(objectAssign({
        maxRedirects: 0
      }, options));
    }

    httpRequest.defaultRequester = request$1;
    httpRequest.ClientError = ClientError$1;
    httpRequest.ServerError = ServerError$1;
    var request_1 = httpRequest;

    var projectHeader = 'X-Sanity-Project-ID';

    var requestOptions = function (config) {
      var overrides = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var headers = {};
      var token = overrides.token || config.token;

      if (token) {
        headers.Authorization = "Bearer ".concat(token);
      }

      if (!overrides.useGlobalApi && !config.useProjectHostname && config.projectId) {
        headers[projectHeader] = config.projectId;
      }

      var withCredentials = Boolean(typeof overrides.withCredentials === 'undefined' ? config.token || config.withCredentials : overrides.withCredentials);
      var timeout = typeof overrides.timeout === 'undefined' ? config.timeout : overrides.timeout;
      return objectAssign({}, overrides, {
        headers: objectAssign({}, headers, overrides.headers || {}),
        timeout: typeof timeout === 'undefined' ? 5 * 60 * 1000 : timeout,
        json: true,
        withCredentials: withCredentials
      });
    };

    var defaultCdnHost = 'apicdn.sanity.io';
    var defaultConfig$1 = {
      apiHost: 'https://api.sanity.io',
      useProjectHostname: true,
      gradientMode: false,
      isPromiseAPI: true
    };
    var LOCALHOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

    var isLocal = function isLocal(host) {
      return LOCALHOSTS.indexOf(host) !== -1;
    }; // eslint-disable-next-line no-console


    var createWarningPrinter = function createWarningPrinter(message) {
      return once(function () {
        return console.warn(message.join(' '));
      });
    };

    var printCdnWarning = createWarningPrinter(['You are not using the Sanity CDN. That means your data is always fresh, but the CDN is faster and', "cheaper. Think about it! For more info, see ".concat(generateHelpUrl('js-client-cdn-configuration'), "."), 'To hide this warning, please set the `useCdn` option to either `true` or `false` when creating', 'the client.']);
    var printBrowserTokenWarning = createWarningPrinter(['You have configured Sanity client to use a token in the browser. This may cause unintentional security issues.', "See ".concat(generateHelpUrl('js-client-browser-token'), " for more information and how to hide this warning.")]);
    var printCdnTokenWarning = createWarningPrinter(['You have set `useCdn` to `true` while also specifying a token. This is usually not what you', 'want. The CDN cannot be used with an authorization token, since private data cannot be cached.', "See ".concat(generateHelpUrl('js-client-usecdn-token'), " for more information.")]);
    var defaultConfig_1 = defaultConfig$1;

    var initConfig = function (config, prevConfig) {
      var newConfig = objectAssign({}, defaultConfig$1, prevConfig, config);
      var gradientMode = newConfig.gradientMode;
      var projectBased = !gradientMode && newConfig.useProjectHostname;

      if (typeof Promise === 'undefined') {
        var helpUrl = generateHelpUrl('js-client-promise-polyfill');
        throw new Error("No native Promise-implementation found, polyfill needed - see ".concat(helpUrl));
      }

      if (gradientMode && !newConfig.namespace) {
        throw new Error('Configuration must contain `namespace` when running in gradient mode');
      }

      if (projectBased && !newConfig.projectId) {
        throw new Error('Configuration must contain `projectId`');
      }

      var isBrowser = typeof window !== 'undefined' && window.location && window.location.hostname;
      var isLocalhost = isBrowser && isLocal(window.location.hostname);

      if (isBrowser && isLocalhost && newConfig.token && newConfig.ignoreBrowserTokenWarning !== true) {
        printBrowserTokenWarning();
      } else if ((!isBrowser || isLocalhost) && newConfig.useCdn && newConfig.token) {
        printCdnTokenWarning();
      } else if (typeof newConfig.useCdn === 'undefined') {
        printCdnWarning();
      }

      if (projectBased) {
        validators.projectId(newConfig.projectId);
      }

      if (!gradientMode && newConfig.dataset) {
        validators.dataset(newConfig.dataset, newConfig.gradientMode);
      }

      newConfig.isDefaultApi = newConfig.apiHost === defaultConfig$1.apiHost;
      newConfig.useCdn = Boolean(newConfig.useCdn) && !newConfig.token && !newConfig.withCredentials;

      if (newConfig.gradientMode) {
        newConfig.url = newConfig.apiHost;
        newConfig.cdnUrl = newConfig.apiHost;
      } else {
        var hostParts = newConfig.apiHost.split('://', 2);
        var protocol = hostParts[0];
        var host = hostParts[1];
        var cdnHost = newConfig.isDefaultApi ? defaultCdnHost : host;

        if (newConfig.useProjectHostname) {
          newConfig.url = "".concat(protocol, "://").concat(newConfig.projectId, ".").concat(host, "/v1");
          newConfig.cdnUrl = "".concat(protocol, "://").concat(newConfig.projectId, ".").concat(cdnHost, "/v1");
        } else {
          newConfig.url = "".concat(newConfig.apiHost, "/v1");
          newConfig.cdnUrl = newConfig.url;
        }
      }

      return newConfig;
    };

    var config$1 = {
    	defaultConfig: defaultConfig_1,
    	initConfig: initConfig
    };

    var filter$4 = filter.filter;

    var map$4 = map.map;





















    var defaultConfig$2 = config$1.defaultConfig,
        initConfig$1 = config$1.initConfig;

    var toPromise$1 = function toPromise(observable) {
      return observable.toPromise();
    };

    function SanityClient() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultConfig$2;

      if (!(this instanceof SanityClient)) {
        return new SanityClient(config);
      }

      this.config(config);
      this.assets = new assetsClient(this);
      this.datasets = new datasetsClient(this);
      this.projects = new projectsClient(this);
      this.users = new usersClient(this);
      this.auth = new authClient(this);

      if (this.clientConfig.isPromiseAPI) {
        var observableConfig = objectAssign({}, this.clientConfig, {
          isPromiseAPI: false
        });
        this.observable = new SanityClient(observableConfig);
      }
    }

    objectAssign(SanityClient.prototype, dataMethods);
    objectAssign(SanityClient.prototype, {
      clone: function clone() {
        return new SanityClient(this.config());
      },
      config: function config(newConfig) {
        if (typeof newConfig === 'undefined') {
          return objectAssign({}, this.clientConfig);
        }

        if (this.observable) {
          var observableConfig = objectAssign({}, newConfig, {
            isPromiseAPI: false
          });
          this.observable.config(observableConfig);
        }

        this.clientConfig = initConfig$1(newConfig, this.clientConfig || {});
        return this;
      },
      getUrl: function getUrl(uri) {
        var canUseCdn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var base = canUseCdn ? this.clientConfig.cdnUrl : this.clientConfig.url;
        return "".concat(base, "/").concat(uri.replace(/^\//, ''));
      },
      isPromiseAPI: function isPromiseAPI() {
        return this.clientConfig.isPromiseAPI;
      },
      _requestObservable: function _requestObservable(options) {
        var uri = options.url || options.uri;
        var canUseCdn = this.clientConfig.useCdn && ['GET', 'HEAD'].indexOf(options.method || 'GET') >= 0 && uri.indexOf('/data/') === 0;
        var reqOptions = requestOptions(this.clientConfig, objectAssign({}, options, {
          url: this.getUrl(uri, canUseCdn)
        }));
        return request_1(reqOptions, this.clientConfig.requester);
      },
      request: function request(options) {
        var observable = this._requestObservable(options).pipe(filter$4(function (event) {
          return event.type === 'response';
        }), map$4(function (event) {
          return event.body;
        }));

        return this.isPromiseAPI() ? toPromise$1(observable) : observable;
      }
    });
    SanityClient.Patch = patch;
    SanityClient.Transaction = transaction;
    SanityClient.ClientError = request_1.ClientError;
    SanityClient.ServerError = request_1.ServerError;
    SanityClient.requester = request_1.defaultRequester;
    var sanityClient = SanityClient;

    var api = {
    	projectId: "4dfvc8wj",
    	dataset: "production"
    };

    const { projectId, dataset } = api;

    const client = sanityClient({
      projectId,
      dataset,
      useCdn: true
    });

    /* static/icons/loading.svg generated by Svelte v3.24.1 */

    function create_fragment$h(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ viewBox: "0 0 300 300" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(nodes, "svg", { xmlns: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true, "fill-rule": true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "M216,197.13l40.07,40.08a13.33,13.33,0,0,1-18.85,18.85L197.14,216A13.34,13.34,0,0,1,216,197.13ZM62.79,43.93,102.86,84A13.34,13.34,0,1,1,84,102.86L43.93,62.79A13.33,13.33,0,0,1,62.78,43.93ZM197.14,84l40.07-40.07a13.33,13.33,0,0,1,18.86,18.85L216,102.86A13.34,13.34,0,0,1,197.13,84ZM43.93,237.21,84,197.14A13.34,13.34,0,0,1,102.87,216L62.79,256.07a13.33,13.33,0,0,1-18.85-18.85ZM163.33,230v56.67a13.33,13.33,0,0,1-26.66,0V230a13.33,13.33,0,0,1,26.66,0Zm0-216.67V70a13.33,13.33,0,0,1-26.66,0V13.33a13.33,13.33,0,0,1,26.66,0ZM230,136.67h56.67a13.33,13.33,0,0,1,0,26.66H230a13.33,13.33,0,0,1,0-26.66Zm-216.67,0H70a13.33,13.33,0,0,1,0,26.66H13.33a13.33,13.33,0,0,1,0-26.66Z");
    			attr(path, "fill-rule", "evenodd");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ viewBox: "0 0 300 300" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Loading extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});
    	}
    }

    /* src/components/loading.svelte generated by Svelte v3.24.1 */
    const file$8 = "src/components/loading.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let loading;
    	let current;
    	loading = new Loading({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(loading.$$.fragment);
    			attr_dev(div, "class", "loading svelte-dottfn");
    			add_location(div, file$8, 34, 0, 619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(loading, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(loading);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Loading", $$slots, []);
    	$$self.$capture_state = () => ({ Loading });
    	return [];
    }

    class Loading_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loading_1",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    var n=.2126,r=.7152,t=.0722,e=1/12.92;function u(n){return Math.pow((n+.055)/1.055,2.4)}function a(a){var i=a[0]/255,c=a[1]/255,o=a[2]/255,s=i<=.03928?i*e:u(i),f=c<=.03928?c*e:u(c),l=o<=.03928?o*e:u(o);return s*n+f*r+l*t}function i(n){var r=255;8===(n=n.replace(/^#/,"")).length&&(r=parseInt(n.slice(6,8),16),n=n.substring(0,6)),4===n.length&&(r=parseInt(n.slice(3,4).repeat(2),16),n=n.substring(0,3)),3===n.length&&(n=n[0]+n[0]+n[1]+n[1]+n[2]+n[2]);var t=parseInt(n,16);return [t>>16,t>>8&255,255&t,r]}function c(n,r){return (Math.max(n,r)+.05)/(Math.min(n,r)+.05)}function o(n,r){return c(a(n),a(r))}function s(n,r){return o(i(n),i(r))}function f(n){return n>=7?"AAA":n>=4.5?"AA":n>=3?"AA Large":"Fail"}

    var index_m = /*#__PURE__*/Object.freeze({
        __proto__: null,
        luminance: c,
        rgb: o,
        hex: s,
        score: f
    });

    var colorName = {
    	"aliceblue": [240, 248, 255],
    	"antiquewhite": [250, 235, 215],
    	"aqua": [0, 255, 255],
    	"aquamarine": [127, 255, 212],
    	"azure": [240, 255, 255],
    	"beige": [245, 245, 220],
    	"bisque": [255, 228, 196],
    	"black": [0, 0, 0],
    	"blanchedalmond": [255, 235, 205],
    	"blue": [0, 0, 255],
    	"blueviolet": [138, 43, 226],
    	"brown": [165, 42, 42],
    	"burlywood": [222, 184, 135],
    	"cadetblue": [95, 158, 160],
    	"chartreuse": [127, 255, 0],
    	"chocolate": [210, 105, 30],
    	"coral": [255, 127, 80],
    	"cornflowerblue": [100, 149, 237],
    	"cornsilk": [255, 248, 220],
    	"crimson": [220, 20, 60],
    	"cyan": [0, 255, 255],
    	"darkblue": [0, 0, 139],
    	"darkcyan": [0, 139, 139],
    	"darkgoldenrod": [184, 134, 11],
    	"darkgray": [169, 169, 169],
    	"darkgreen": [0, 100, 0],
    	"darkgrey": [169, 169, 169],
    	"darkkhaki": [189, 183, 107],
    	"darkmagenta": [139, 0, 139],
    	"darkolivegreen": [85, 107, 47],
    	"darkorange": [255, 140, 0],
    	"darkorchid": [153, 50, 204],
    	"darkred": [139, 0, 0],
    	"darksalmon": [233, 150, 122],
    	"darkseagreen": [143, 188, 143],
    	"darkslateblue": [72, 61, 139],
    	"darkslategray": [47, 79, 79],
    	"darkslategrey": [47, 79, 79],
    	"darkturquoise": [0, 206, 209],
    	"darkviolet": [148, 0, 211],
    	"deeppink": [255, 20, 147],
    	"deepskyblue": [0, 191, 255],
    	"dimgray": [105, 105, 105],
    	"dimgrey": [105, 105, 105],
    	"dodgerblue": [30, 144, 255],
    	"firebrick": [178, 34, 34],
    	"floralwhite": [255, 250, 240],
    	"forestgreen": [34, 139, 34],
    	"fuchsia": [255, 0, 255],
    	"gainsboro": [220, 220, 220],
    	"ghostwhite": [248, 248, 255],
    	"gold": [255, 215, 0],
    	"goldenrod": [218, 165, 32],
    	"gray": [128, 128, 128],
    	"green": [0, 128, 0],
    	"greenyellow": [173, 255, 47],
    	"grey": [128, 128, 128],
    	"honeydew": [240, 255, 240],
    	"hotpink": [255, 105, 180],
    	"indianred": [205, 92, 92],
    	"indigo": [75, 0, 130],
    	"ivory": [255, 255, 240],
    	"khaki": [240, 230, 140],
    	"lavender": [230, 230, 250],
    	"lavenderblush": [255, 240, 245],
    	"lawngreen": [124, 252, 0],
    	"lemonchiffon": [255, 250, 205],
    	"lightblue": [173, 216, 230],
    	"lightcoral": [240, 128, 128],
    	"lightcyan": [224, 255, 255],
    	"lightgoldenrodyellow": [250, 250, 210],
    	"lightgray": [211, 211, 211],
    	"lightgreen": [144, 238, 144],
    	"lightgrey": [211, 211, 211],
    	"lightpink": [255, 182, 193],
    	"lightsalmon": [255, 160, 122],
    	"lightseagreen": [32, 178, 170],
    	"lightskyblue": [135, 206, 250],
    	"lightslategray": [119, 136, 153],
    	"lightslategrey": [119, 136, 153],
    	"lightsteelblue": [176, 196, 222],
    	"lightyellow": [255, 255, 224],
    	"lime": [0, 255, 0],
    	"limegreen": [50, 205, 50],
    	"linen": [250, 240, 230],
    	"magenta": [255, 0, 255],
    	"maroon": [128, 0, 0],
    	"mediumaquamarine": [102, 205, 170],
    	"mediumblue": [0, 0, 205],
    	"mediumorchid": [186, 85, 211],
    	"mediumpurple": [147, 112, 219],
    	"mediumseagreen": [60, 179, 113],
    	"mediumslateblue": [123, 104, 238],
    	"mediumspringgreen": [0, 250, 154],
    	"mediumturquoise": [72, 209, 204],
    	"mediumvioletred": [199, 21, 133],
    	"midnightblue": [25, 25, 112],
    	"mintcream": [245, 255, 250],
    	"mistyrose": [255, 228, 225],
    	"moccasin": [255, 228, 181],
    	"navajowhite": [255, 222, 173],
    	"navy": [0, 0, 128],
    	"oldlace": [253, 245, 230],
    	"olive": [128, 128, 0],
    	"olivedrab": [107, 142, 35],
    	"orange": [255, 165, 0],
    	"orangered": [255, 69, 0],
    	"orchid": [218, 112, 214],
    	"palegoldenrod": [238, 232, 170],
    	"palegreen": [152, 251, 152],
    	"paleturquoise": [175, 238, 238],
    	"palevioletred": [219, 112, 147],
    	"papayawhip": [255, 239, 213],
    	"peachpuff": [255, 218, 185],
    	"peru": [205, 133, 63],
    	"pink": [255, 192, 203],
    	"plum": [221, 160, 221],
    	"powderblue": [176, 224, 230],
    	"purple": [128, 0, 128],
    	"rebeccapurple": [102, 51, 153],
    	"red": [255, 0, 0],
    	"rosybrown": [188, 143, 143],
    	"royalblue": [65, 105, 225],
    	"saddlebrown": [139, 69, 19],
    	"salmon": [250, 128, 114],
    	"sandybrown": [244, 164, 96],
    	"seagreen": [46, 139, 87],
    	"seashell": [255, 245, 238],
    	"sienna": [160, 82, 45],
    	"silver": [192, 192, 192],
    	"skyblue": [135, 206, 235],
    	"slateblue": [106, 90, 205],
    	"slategray": [112, 128, 144],
    	"slategrey": [112, 128, 144],
    	"snow": [255, 250, 250],
    	"springgreen": [0, 255, 127],
    	"steelblue": [70, 130, 180],
    	"tan": [210, 180, 140],
    	"teal": [0, 128, 128],
    	"thistle": [216, 191, 216],
    	"tomato": [255, 99, 71],
    	"turquoise": [64, 224, 208],
    	"violet": [238, 130, 238],
    	"wheat": [245, 222, 179],
    	"white": [255, 255, 255],
    	"whitesmoke": [245, 245, 245],
    	"yellow": [255, 255, 0],
    	"yellowgreen": [154, 205, 50]
    };

    var colorcolor_1 = createCommonjsModule(function (module) {
    /*jshint esversion: 6 */

    function colorcolor(color, newColor = "rgba", calculateOpacity = false) {
    	color = color.toLowerCase();
    	newColor = newColor.toLowerCase();
    	var returnedColor = color;
    	var namedColor = colorName;
    	var r,g,b,a;
    	var roundTo = 4;
    	var colorDefinitions = {
    		rgb: {
    			re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
    			example: [ "rgb(123, 234, 45)", "rgb(255,234,245)" ],
    			toRGBA: function (bits) {
    				return [
    					parseInt(bits[ 1 ], 10), parseInt(bits[ 2 ], 10), parseInt(bits[ 3 ], 10), 1
    				];
    			}
    		},
    		rgba: {
    			re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+(?:\.\d+)?|\.\d+)\s*\)/,
    			example: [ "rgba(123, 234, 45, 1)", "rgba(255,234,245, 0.5)" ],
    			toRGBA: function (bits) {
    				return [
    					parseInt(bits[ 1 ], 10), parseInt(bits[ 2 ], 10), parseInt(bits[ 3 ], 10), parseFloat(bits[ 4 ])
    				];
    			}
    		},
    		hex: {
    			re: /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    			example: [ "00ff00", "336699" ],
    			toRGBA: function (bits) {
    				return [
    					parseInt(bits[ 1 ], 16), parseInt(bits[ 2 ], 16), parseInt(bits[ 3 ], 16), 1
    				];
    			}
    		},
    		hex3: {
    			re: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    			example: [ "fb0", "f0f" ],
    			toRGBA: function (bits) {
    				return [
    					parseInt(bits[ 1 ] + bits[ 1 ], 16), parseInt(bits[ 2 ] + bits[ 2 ], 16), parseInt(bits[ 3 ] + bits[ 3 ], 16), 1
    				];
    			}
    		},
    		hexa: {
    			re: /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    			example: [ "00ff00ff", "336699a0" ],
    			toRGBA: function (bits) {
    				return [
    					parseInt(bits[ 1 ], 16), parseInt(bits[ 2 ], 16), parseInt(bits[ 3 ], 16), (parseInt(bits[ 4 ], 16) / 255)
    				];
    			}
    		},
    		hex4a: {
    			re: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    			example: [ "fb0f", "f0f8" ],
    			toRGBA: function (bits) {
    				return [
    					parseInt(bits[ 1 ] + bits[ 1 ], 16), parseInt(bits[ 2 ] + bits[ 2 ], 16), parseInt(bits[ 3 ] + bits[ 3 ], 16), (parseInt(bits[ 4 ] + bits[ 4 ], 16) / 255)
    				];
    			}
    		},
    		hsl: {
    			re: /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
    			example: [ "hsl(120, 100%, 25%)", "hsl(0, 100%, 50%)" ],
    			toRGBA: function (bits) {
    				bits[ 4 ] = 1;
    				var rgba = hslToRgb(bits);
    				return [
    					rgba.r, rgba.g, rgba.b, rgba.a
    				];
    			}
    		},
    		hsla: {
    			re: /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d+(?:\.\d+)?|\.\d+)\s*\)/,
    			example: [ "hsla(120, 100%, 25%, 1)", "hsla(0, 100%, 50%, 0.5)" ],
    			toRGBA: function (bits) {
    				var rgba = hslToRgb(bits);
    				return [
    					rgba.r, rgba.g, rgba.b, rgba.a
    				];
    			}
    		},
    		hsv: {
    			re: /^hsv\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
    			example: [ "hsv(120, 100%, 25%)", "hsv(0, 100%, 50%)" ],
    			toRGBA: function (bits) {
    				var rgb = hsvToRgb(bits);
    				return [
    					rgb.r, rgb.g, rgb.b, 1
    				];
    			}
    		},
    		hsb: {
    			re: /^hsb\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
    			example: [ "hsb(120, 100%, 25%)", "hsb(0, 100%, 50%)" ],
    			toRGBA: function (bits) {
    				var rgb = hsvToRgb(bits);
    				return [
    					rgb.r, rgb.g, rgb.b, 1
    				];
    			}
    		}
    	};

    	// If this is a named color, convert it to hex
    	if (namedColor.hasOwnProperty(color)) {
    		color = namedColor[color];
    		color.forEach(function(piece, index) {
    			color[index] = ("0" + piece.toString(16)).slice(-2);
    		});
    		color = "#" + color.join('');
    	}

    	// Search the color definitions for a match
    	for (let colorDefinition in colorDefinitions) {
    		let re = colorDefinitions[colorDefinition].re;
    		let processor = colorDefinitions[colorDefinition].toRGBA;
    		let bits = re.exec(color);
    		if (bits) {
    			let channels = processor(bits);
    			r = channels[0];
    			g = channels[1];
    			b = channels[2];
    			a = +(Math.round(channels[3] + ("e+" + roundTo)) + ("e-" + roundTo));
    		}
    	}
    	r = Math.round( ( r < 0 || isNaN(r) ) ? 0 : ( ( r > 255 ) ? 255 : r ) );
    	g = Math.round( ( g < 0 || isNaN(g) ) ? 0 : ( ( g > 255 ) ? 255 : g ) );
    	b = Math.round( ( b < 0 || isNaN(b) ) ? 0 : ( ( b > 255 ) ? 255 : b ) );
    	a = ( a < 0 || isNaN(a) ) ? 0 : ( ( a > 1 ) ? 1 : a );

    	switch (newColor) {
    		case "hex":
    			returnedColor = "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
    			break;
    		case "hexa":
    			if (calculateOpacity) {
    				[r, g, b, a] = calculateOpacityFromWhite(r, g, b, a);
    			}
    			returnedColor = "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2) + ("0" + (Math.round(255 * a)).toString(16)).slice(-2);
    			break;
    		case "hsl":
    			let hsl = rgbToHsl({ "r": r, "g": g, "b": b });
    			returnedColor = `hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`;
    			break;
    		case "hsla":
    			if (calculateOpacity) {
    				[r, g, b, a] = calculateOpacityFromWhite(r, g, b, a);
    			}
    			let hsla = rgbToHsl({ "r": r, "g": g, "b": b, "a": a });
    			returnedColor = `hsla(${hsla.h},${hsla.s}%,${hsla.l}%,${hsla.a})`;
    			break;
    		case "hsb":
    			/* Same as `hsv` */
    			let hsb = rgbToHsv({ "r": r, "g": g, "b": b });
    			returnedColor = `hsb(${hsb.h},${hsb.s}%,${hsb.v}%)`;
    			break;
    		case "hsv":
    			let hsv = rgbToHsv({ "r": r, "g": g, "b": b });
    			returnedColor = `hsv(${hsv.h},${hsv.s}%,${hsv.v}%)`;
    			break;
    		case "rgb":
    			returnedColor = `rgb(${r},${g},${b})`;
    			break;
    		case "rgba":
    		/* falls through */
    		default:
    			if (calculateOpacity) {
    				[r, g, b, a] = calculateOpacityFromWhite(r, g, b, a);
    			}
    			returnedColor = `rgba(${r},${g},${b},${a})`;
    			break;
    	}

    	return returnedColor;
    }

    function calculateOpacityFromWhite(r, g, b, a) {
    	var min = 0;
    	a = ( 255 - ( min = Math.min(r, g, b) ) ) / 255;
    	r = (  ( r - min ) / a ).toFixed(0);
    	g = (  ( g - min ) / a ).toFixed(0);
    	b = (  ( b - min ) / a ).toFixed(0);
    	a = parseFloat(a.toFixed(4));

    	return [r, g, b, a];
    }

    function hslToRgb(bits) {
    	var rgba = {}, hsl = {
    		h: bits[1] / 360,
    		s: bits[2] / 100,
    		l: bits[3] / 100,
    		a: parseFloat(bits[ 4 ])
    	};
    	if (hsl.s === 0) {
    		let v = 255 * hsl.l;
    		rgba = {
    			r: v,
    			g: v,
    			b: v,
    			a: hsl.a
    		};
    	} else {
    		let q = hsl.l < 0.5 ? hsl.l * ( 1 + hsl.s ) : ( hsl.l + hsl.s ) - ( hsl.l * hsl.s );
    		let p = 2 * hsl.l - q;
    		rgba.r = hueToRgb(p, q, hsl.h + ( 1 / 3 ) ) * 255;
    		rgba.g = hueToRgb(p, q, hsl.h) * 255;
    		rgba.b = hueToRgb(p, q, hsl.h - ( 1 / 3 ) ) * 255;
    		rgba.a = hsl.a;
    	}

    	return rgba;
    }

    function rgbToHsl(rgba) {
    	rgba.r = rgba.r / 255;
    	rgba.g = rgba.g / 255;
    	rgba.b = rgba.b / 255;
    	var max = Math.max(rgba.r, rgba.g, rgba.b), min = Math.min(rgba.r, rgba.g, rgba.b), hsl = [], d;
    	hsl.a = rgba.a;
    	hsl.l = ( max + min ) / 2;
    	if (max === min) {
    		hsl.h = 0;
    		hsl.s = 0;
    	} else {
    		d = max - min;
    		hsl.s = hsl.l >= 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
    		switch (max) {
    			case rgba.r:
    				hsl.h = ( rgba.g - rgba.b ) / d + ( rgba.g < rgba.b ? 6 : 0 );
    				break;
    			case rgba.g:
    				hsl.h = ( rgba.b - rgba.r ) / d + 2;
    				break;
    			case rgba.b:
    				hsl.h = ( rgba.r - rgba.g ) / d + 4;
    				break;
    		}
    		hsl.h /= 6;
    	}
    	hsl.h = parseInt(( hsl.h * 360 ).toFixed(0), 10);
    	hsl.s = parseInt(( hsl.s * 100 ).toFixed(0), 10);
    	hsl.l = parseInt(( hsl.l * 100 ).toFixed(0), 10);

    	return hsl;
    }

    function hsvToRgb(bits) {
    	var rgb = {}, hsv = {
    		h: bits[1] / 360,
    		s: bits[2] / 100,
    		v: bits[3] / 100
    	}, i = Math.floor(hsv.h * 6), f = hsv.h * 6 - i, p = hsv.v * ( 1 - hsv.s ), q = hsv.v * ( 1 - f * hsv.s ), t = hsv.v * ( 1 - ( 1 - f ) * hsv.s );
    	switch (i % 6) {
    		case 0:
    			rgb.r = hsv.v;
    			rgb.g = t;
    			rgb.b = p;
    			break;
    		case 1:
    			rgb.r = q;
    			rgb.g = hsv.v;
    			rgb.b = p;
    			break;
    		case 2:
    			rgb.r = p;
    			rgb.g = hsv.v;
    			rgb.b = t;
    			break;
    		case 3:
    			rgb.r = p;
    			rgb.g = q;
    			rgb.b = hsv.v;
    			break;
    		case 4:
    			rgb.r = t;
    			rgb.g = p;
    			rgb.b = hsv.v;
    			break;
    		case 5:
    			rgb.r = hsv.v;
    			rgb.g = p;
    			rgb.b = q;
    			break;
    	}
    	rgb.r = rgb.r * 255;
    	rgb.g = rgb.g * 255;
    	rgb.b = rgb.b * 255;

    	return rgb;
    }

    function rgbToHsv(rgba) {
    	rgba.r = toPercent(parseInt(rgba.r, 10) % 256, 256);
    	rgba.g = toPercent(parseInt(rgba.g, 10) % 256, 256);
    	rgba.b = toPercent(parseInt(rgba.b, 10) % 256, 256);
    	var max = Math.max(rgba.r, rgba.g, rgba.b), min = Math.min(rgba.r, rgba.g, rgba.b), d = max - min, hsv = {
    		"h": 0,
    		"s": max === 0 ? 0 : d / max,
    		"v": max
    	};
    	if (max !== min) {
    		switch (max) {
    			case rgba.r:
    				hsv.h = ( rgba.g - rgba.b ) / d + ( rgba.g < rgba.b ? 6 : 0 );
    				break;
    			case rgba.g:
    				hsv.h = ( rgba.b - rgba.r ) / d + 2;
    				break;
    			case rgba.b:
    				hsv.h = ( rgba.r - rgba.g ) / d + 4;
    				break;
    		}
    		hsv.h /= 6;
    	}
    	hsv.h = parseInt(( hsv.h * 360 ).toFixed(0), 10);
    	hsv.s = parseInt(( hsv.s * 100 ).toFixed(0), 10);
    	hsv.v = parseInt(( hsv.v * 100 ).toFixed(0), 10);

    	return hsv;
    }

    function hueToRgb(p, q, t) {
    	if (t < 0) {
    		t += 1;
    	}
    	if (t > 1) {
    		t -= 1;
    	}
    	if (t < 1 / 6) {
    		return p + ( q - p ) * 6 * t;
    	}
    	if (t < 1 / 2) {
    		return q;
    	}
    	if (t < 2 / 3) {
    		return p + ( q - p ) * ( ( 2 / 3 - t ) * 6 );
    	}

    	return p;
    }

    function toPercent(amount, limit) {
    	return amount / limit;
    }

    module.exports = colorcolor;
    commonjsGlobal.colorcolor = module.exports; /* ew */
    });

    function generateChart(colorArray) {

      // transform the array into one of object with name and hex values
      const colorArrayWithNames = colorArray.map(function(color) {
        if(typeof color === 'string') {
          return { 'name': color, 'value': colorcolor_1(color, 'hex') }
        } else if (typeof color === 'object' && !!color.name && !!color.value) {
          return { 'name': color.name, 'value': colorcolor_1(color.value, 'hex') }
        } else {
          throw new Error("Somethin' aint right with your color array.")
        }
      });

      // methods used to do it to 'em

      function getContrast(textColor, backgroundColor) {
        return index_m.hex(textColor, backgroundColor).toFixed(1)
      }

      function getScore(textColor, backgroundColor) {
        const labelRatioScore = getContrast(textColor, backgroundColor);
        if (labelRatioScore >= 7.0) {
          return 'AAA'
        } else if (labelRatioScore >= 4.5) {
          return 'AA'
        } else if (labelRatioScore >= 3.0) {
          return '18+'
        } else {
          return 'fail'
        }
      }

      // where the magic happens and the work actually gets done

      const colorChart = [];

      colorArrayWithNames.map(function(textColor) {
        // don't compare the color to itself
        const otherColors = colorArrayWithNames.filter(function(color) {
          return color.value !== textColor.value
        });

        const colorObject = {
          name: textColor.name,
          value: textColor.value,
          combinationScores: []
        };

        otherColors.map(function(backgroundColor){
          colorObject.combinationScores.push({
            name: backgroundColor.name,
            value: backgroundColor.value,
            ratio: getContrast(textColor.value, backgroundColor.value),
            score: getScore(textColor.value, backgroundColor.value)
          });
        });

        colorChart.push(colorObject);
      });
      
      return colorChart
    }

    var colorContrastTable = generateChart;

    const colorArray = writable();

    const getLabelColor = color => {
      const score = s('#fffff', color).toFixed(1);
      let labelTextColor = '#000000';
      if (score >= 3.0) {
        labelTextColor = '#ffffff';
      }
      return labelTextColor
    };

    var index_umd = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	 factory(exports) ;
    }(commonjsGlobal, (function (exports) {
    	/* eslint-disable no-undefined,no-param-reassign,no-shadow */

    	/**
    	 * Throttle execution of a function. Especially useful for rate limiting
    	 * execution of handlers on events like resize and scroll.
    	 *
    	 * @param  {number}    delay -          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
    	 * @param  {boolean}   [noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
    	 *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
    	 *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
    	 *                                    the internal counter is reset).
    	 * @param  {Function}  callback -       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
    	 *                                    to `callback` when the throttled-function is executed.
    	 * @param  {boolean}   [debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
    	 *                                    schedule `callback` to execute after `delay` ms.
    	 *
    	 * @returns {Function}  A new, throttled, function.
    	 */
    	function throttle (delay, noTrailing, callback, debounceMode) {
    	  /*
    	   * After wrapper has stopped being called, this timeout ensures that
    	   * `callback` is executed at the proper times in `throttle` and `end`
    	   * debounce modes.
    	   */
    	  var timeoutID;
    	  var cancelled = false; // Keep track of the last time `callback` was executed.

    	  var lastExec = 0; // Function to clear existing timeout

    	  function clearExistingTimeout() {
    	    if (timeoutID) {
    	      clearTimeout(timeoutID);
    	    }
    	  } // Function to cancel next exec


    	  function cancel() {
    	    clearExistingTimeout();
    	    cancelled = true;
    	  } // `noTrailing` defaults to falsy.


    	  if (typeof noTrailing !== 'boolean') {
    	    debounceMode = callback;
    	    callback = noTrailing;
    	    noTrailing = undefined;
    	  }
    	  /*
    	   * The `wrapper` function encapsulates all of the throttling / debouncing
    	   * functionality and when executed will limit the rate at which `callback`
    	   * is executed.
    	   */


    	  function wrapper() {
    	    for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
    	      arguments_[_key] = arguments[_key];
    	    }

    	    var self = this;
    	    var elapsed = Date.now() - lastExec;

    	    if (cancelled) {
    	      return;
    	    } // Execute `callback` and update the `lastExec` timestamp.


    	    function exec() {
    	      lastExec = Date.now();
    	      callback.apply(self, arguments_);
    	    }
    	    /*
    	     * If `debounceMode` is true (at begin) this is used to clear the flag
    	     * to allow future `callback` executions.
    	     */


    	    function clear() {
    	      timeoutID = undefined;
    	    }

    	    if (debounceMode && !timeoutID) {
    	      /*
    	       * Since `wrapper` is being called for the first time and
    	       * `debounceMode` is true (at begin), execute `callback`.
    	       */
    	      exec();
    	    }

    	    clearExistingTimeout();

    	    if (debounceMode === undefined && elapsed > delay) {
    	      /*
    	       * In throttle mode, if `delay` time has been exceeded, execute
    	       * `callback`.
    	       */
    	      exec();
    	    } else if (noTrailing !== true) {
    	      /*
    	       * In trailing throttle mode, since `delay` time has not been
    	       * exceeded, schedule `callback` to execute `delay` ms after most
    	       * recent execution.
    	       *
    	       * If `debounceMode` is true (at begin), schedule `clear` to execute
    	       * after `delay` ms.
    	       *
    	       * If `debounceMode` is false (at end), schedule `callback` to
    	       * execute after `delay` ms.
    	       */
    	      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
    	    }
    	  }

    	  wrapper.cancel = cancel; // Return the wrapper function.

    	  return wrapper;
    	}

    	/* eslint-disable no-undefined */
    	/**
    	 * Debounce execution of a function. Debouncing, unlike throttling,
    	 * guarantees that a function is only executed a single time, either at the
    	 * very beginning of a series of calls, or at the very end.
    	 *
    	 * @param  {number}   delay -         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
    	 * @param  {boolean}  [atBegin] -     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
    	 *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
    	 *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
    	 * @param  {Function} callback -      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
    	 *                                  to `callback` when the debounced-function is executed.
    	 *
    	 * @returns {Function} A new, debounced function.
    	 */

    	function debounce (delay, atBegin, callback) {
    	  return callback === undefined ? throttle(delay, atBegin, false) : throttle(delay, callback, atBegin !== false);
    	}

    	exports.debounce = debounce;
    	exports.throttle = throttle;

    	Object.defineProperty(exports, '__esModule', { value: true });

    })));

    });

    /* node_modules/color-contrast-table-svelte/src/edit-name.svelte generated by Svelte v3.24.1 */
    const file$9 = "node_modules/color-contrast-table-svelte/src/edit-name.svelte";

    function create_fragment$j(ctx) {
    	let label;
    	let span;
    	let t0;
    	let t1;
    	let input;
    	let input_title_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span = element("span");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = space();
    			input = element("input");
    			add_location(span, file$9, 19, 2, 584);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "title", input_title_value = `${/*value*/ ctx[0]} name`);
    			input.value = /*value*/ ctx[0];
    			add_location(input, file$9, 22, 2, 615);
    			attr_dev(label, "class", "color-contrast-table__header-label color-contrast-table__header-label--edit-name");
    			add_location(label, file$9, 18, 0, 485);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);
    			append_dev(span, t0);
    			append_dev(label, t1);
    			append_dev(label, input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler*/ ctx[4], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t0, /*value*/ ctx[0]);

    			if (dirty & /*value*/ 1 && input_title_value !== (input_title_value = `${/*value*/ ctx[0]} name`)) {
    				attr_dev(input, "title", input_title_value);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				prop_dev(input, "value", /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { value = "" } = $$props;
    	let { index = "" } = $$props;
    	let { onBlur } = $$props;

    	let { onChange = index_umd.debounce(0, false, (index, value) => {
    		// guard against array map failing
    		if (value === "") {
    			value = `Color ${index + 1}`;
    		}

    		colorArray.update(colorArray => {
    			const newColors = [...colorArray];
    			newColors[index].name = value;
    			return newColors;
    		});
    	}) } = $$props;

    	const writable_props = ["value", "index", "onBlur", "onChange"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Edit_name> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Edit_name", $$slots, []);
    	const input_handler = event => onChange(index, event.target.value);
    	const blur_handler = event => onBlur(event);

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("onBlur" in $$props) $$invalidate(2, onBlur = $$props.onBlur);
    		if ("onChange" in $$props) $$invalidate(3, onChange = $$props.onChange);
    	};

    	$$self.$capture_state = () => ({
    		debounce: index_umd.debounce,
    		value,
    		index,
    		onBlur,
    		colorArray,
    		onChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("onBlur" in $$props) $$invalidate(2, onBlur = $$props.onBlur);
    		if ("onChange" in $$props) $$invalidate(3, onChange = $$props.onChange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, index, onBlur, onChange, input_handler, blur_handler];
    }

    class Edit_name extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			value: 0,
    			index: 1,
    			onBlur: 2,
    			onChange: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Edit_name",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onBlur*/ ctx[2] === undefined && !("onBlur" in props)) {
    			console.warn("<Edit_name> was created without expected prop 'onBlur'");
    		}
    	}

    	get value() {
    		throw new Error("<Edit_name>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Edit_name>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Edit_name>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Edit_name>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onBlur() {
    		throw new Error("<Edit_name>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onBlur(value) {
    		throw new Error("<Edit_name>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<Edit_name>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<Edit_name>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/color-contrast-table-svelte/src/edit-value.svelte generated by Svelte v3.24.1 */
    const file$a = "node_modules/color-contrast-table-svelte/src/edit-value.svelte";

    function create_fragment$k(ctx) {
    	let label;
    	let span;
    	let t0;
    	let t1;
    	let input;
    	let input_title_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			span = element("span");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = space();
    			input = element("input");
    			add_location(span, file$a, 17, 2, 492);
    			attr_dev(input, "type", "color");
    			attr_dev(input, "title", input_title_value = `${/*value*/ ctx[0]} color`);
    			input.value = /*value*/ ctx[0];
    			add_location(input, file$a, 20, 2, 523);
    			attr_dev(label, "class", "color-contrast-table__header-label color-contrast-table__header-label--edit-value");
    			add_location(label, file$a, 16, 0, 392);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span);
    			append_dev(span, t0);
    			append_dev(label, t1);
    			append_dev(label, input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler*/ ctx[4], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t0, /*value*/ ctx[0]);

    			if (dirty & /*value*/ 1 && input_title_value !== (input_title_value = `${/*value*/ ctx[0]} color`)) {
    				attr_dev(input, "title", input_title_value);
    			}

    			if (dirty & /*value*/ 1) {
    				prop_dev(input, "value", /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { value = "" } = $$props;
    	let { index = "" } = $$props;
    	let { onBlur } = $$props;

    	let { onChange = index_umd.debounce(0, false, (index, value) => {
    		colorArray.update(colorArray => {
    			const newColors = [...colorArray];
    			newColors[index].value = value;
    			return newColors;
    		});
    	}) } = $$props;

    	const writable_props = ["value", "index", "onBlur", "onChange"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Edit_value> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Edit_value", $$slots, []);
    	const input_handler = event => onChange(index, event.target.value);
    	const blur_handler = event => onBlur(event);

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("onBlur" in $$props) $$invalidate(2, onBlur = $$props.onBlur);
    		if ("onChange" in $$props) $$invalidate(3, onChange = $$props.onChange);
    	};

    	$$self.$capture_state = () => ({
    		debounce: index_umd.debounce,
    		value,
    		index,
    		onBlur,
    		colorArray,
    		onChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("onBlur" in $$props) $$invalidate(2, onBlur = $$props.onBlur);
    		if ("onChange" in $$props) $$invalidate(3, onChange = $$props.onChange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, index, onBlur, onChange, input_handler, blur_handler];
    }

    class Edit_value extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			value: 0,
    			index: 1,
    			onBlur: 2,
    			onChange: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Edit_value",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onBlur*/ ctx[2] === undefined && !("onBlur" in props)) {
    			console.warn("<Edit_value> was created without expected prop 'onBlur'");
    		}
    	}

    	get value() {
    		throw new Error("<Edit_value>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Edit_value>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Edit_value>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Edit_value>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onBlur() {
    		throw new Error("<Edit_value>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onBlur(value) {
    		throw new Error("<Edit_value>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<Edit_value>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<Edit_value>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/color-contrast-table-svelte/src/header.svelte generated by Svelte v3.24.1 */
    const file$b = "node_modules/color-contrast-table-svelte/src/header.svelte";

    // (30:2) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let t_value = /*color*/ ctx[0].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "color-contrast-table__header-label");
    			add_location(span, file$b, 30, 4, 636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*color*/ 1 && t_value !== (t_value = /*color*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(30:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#if editNames}
    function create_if_block_1$3(ctx) {
    	let editname;
    	let current;

    	editname = new Edit_name({
    			props: {
    				onChange: /*onNamesChange*/ ctx[4],
    				onBlur: /*onInputBlur*/ ctx[6],
    				value: /*color*/ ctx[0].name,
    				index: /*index*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(editname.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editname, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editname_changes = {};
    			if (dirty & /*onNamesChange*/ 16) editname_changes.onChange = /*onNamesChange*/ ctx[4];
    			if (dirty & /*onInputBlur*/ 64) editname_changes.onBlur = /*onInputBlur*/ ctx[6];
    			if (dirty & /*color*/ 1) editname_changes.value = /*color*/ ctx[0].name;
    			if (dirty & /*index*/ 2) editname_changes.index = /*index*/ ctx[1];
    			editname.$set(editname_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editname.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editname.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editname, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(23:2) {#if editNames}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = /*color*/ ctx[0].value + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "color-contrast-table__header-label");
    			add_location(span, file$b, 43, 4, 886);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*color*/ 1 && t_value !== (t_value = /*color*/ ctx[0].value + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:2) {#if editValues}
    function create_if_block$4(ctx) {
    	let editvalue;
    	let current;

    	editvalue = new Edit_value({
    			props: {
    				onChange: /*onValuesChange*/ ctx[5],
    				onBlur: /*onInputBlur*/ ctx[6],
    				value: /*color*/ ctx[0].value,
    				index: /*index*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(editvalue.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editvalue, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editvalue_changes = {};
    			if (dirty & /*onValuesChange*/ 32) editvalue_changes.onChange = /*onValuesChange*/ ctx[5];
    			if (dirty & /*onInputBlur*/ 64) editvalue_changes.onBlur = /*onInputBlur*/ ctx[6];
    			if (dirty & /*color*/ 1) editvalue_changes.value = /*color*/ ctx[0].value;
    			if (dirty & /*index*/ 2) editvalue_changes.index = /*index*/ ctx[1];
    			editvalue.$set(editvalue_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editvalue.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editvalue.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editvalue, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(36:2) {#if editValues}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let th;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current_block_type_index_1;
    	let if_block1;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*editNames*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block$4, create_else_block];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*editValues*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			if_block0.c();
    			t = space();
    			if_block1.c();
    			attr_dev(th, "class", "color-contrast-table__header");
    			set_style(th, "background", /*color*/ ctx[0].value);
    			set_style(th, "color", getLabelColor(/*color*/ ctx[0].value));
    			add_location(th, file$b, 15, 0, 349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			if_blocks[current_block_type_index].m(th, null);
    			append_dev(th, t);
    			if_blocks_1[current_block_type_index_1].m(th, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(th, t);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(th, null);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(th, "background", /*color*/ ctx[0].value);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(th, "color", getLabelColor(/*color*/ ctx[0].value));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if_blocks[current_block_type_index].d();
    			if_blocks_1[current_block_type_index_1].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { color = {} } = $$props;
    	let { index } = $$props;
    	let { editNames = false } = $$props;
    	let { editValues = false } = $$props;
    	let { onNamesChange } = $$props;
    	let { onValuesChange } = $$props;
    	let { onInputBlur } = $$props;

    	const writable_props = [
    		"color",
    		"index",
    		"editNames",
    		"editValues",
    		"onNamesChange",
    		"onValuesChange",
    		"onInputBlur"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("editNames" in $$props) $$invalidate(2, editNames = $$props.editNames);
    		if ("editValues" in $$props) $$invalidate(3, editValues = $$props.editValues);
    		if ("onNamesChange" in $$props) $$invalidate(4, onNamesChange = $$props.onNamesChange);
    		if ("onValuesChange" in $$props) $$invalidate(5, onValuesChange = $$props.onValuesChange);
    		if ("onInputBlur" in $$props) $$invalidate(6, onInputBlur = $$props.onInputBlur);
    	};

    	$$self.$capture_state = () => ({
    		color,
    		index,
    		editNames,
    		editValues,
    		onNamesChange,
    		onValuesChange,
    		onInputBlur,
    		getLabelColor,
    		EditName: Edit_name,
    		EditValue: Edit_value
    	});

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("editNames" in $$props) $$invalidate(2, editNames = $$props.editNames);
    		if ("editValues" in $$props) $$invalidate(3, editValues = $$props.editValues);
    		if ("onNamesChange" in $$props) $$invalidate(4, onNamesChange = $$props.onNamesChange);
    		if ("onValuesChange" in $$props) $$invalidate(5, onValuesChange = $$props.onValuesChange);
    		if ("onInputBlur" in $$props) $$invalidate(6, onInputBlur = $$props.onInputBlur);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		color,
    		index,
    		editNames,
    		editValues,
    		onNamesChange,
    		onValuesChange,
    		onInputBlur
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			color: 0,
    			index: 1,
    			editNames: 2,
    			editValues: 3,
    			onNamesChange: 4,
    			onValuesChange: 5,
    			onInputBlur: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<Header> was created without expected prop 'index'");
    		}

    		if (/*onNamesChange*/ ctx[4] === undefined && !("onNamesChange" in props)) {
    			console.warn("<Header> was created without expected prop 'onNamesChange'");
    		}

    		if (/*onValuesChange*/ ctx[5] === undefined && !("onValuesChange" in props)) {
    			console.warn("<Header> was created without expected prop 'onValuesChange'");
    		}

    		if (/*onInputBlur*/ ctx[6] === undefined && !("onInputBlur" in props)) {
    			console.warn("<Header> was created without expected prop 'onInputBlur'");
    		}
    	}

    	get color() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editNames() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editNames(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editValues() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editValues(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onNamesChange() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNamesChange(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onValuesChange() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onValuesChange(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInputBlur() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInputBlur(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/color-contrast-table-svelte/src/color.svelte generated by Svelte v3.24.1 */
    const file$c = "node_modules/color-contrast-table-svelte/src/color.svelte";

    function create_fragment$m(ctx) {
    	let td;
    	let div;
    	let span;

    	let t_value = (/*color*/ ctx[0].score !== "fail"
    	? /*color*/ ctx[0].score
    	: "X") + "";

    	let t;
    	let div_title_value;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			td = element("td");
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "color-contrast-table__color-score");
    			add_location(span, file$c, 15, 4, 427);
    			attr_dev(div, "title", div_title_value = `${/*color*/ ctx[0].ratio} : 1`);

    			attr_dev(div, "class", div_class_value = /*color*/ ctx[0].score !== "fail"
    			? "color-contrast-table__color-block"
    			: "color-contrast-table__color-block color-contrast-table__color-block--fail");

    			set_style(div, "background", /*color*/ ctx[0].value);
    			set_style(div, "color", getLabelColor(/*color*/ ctx[0].value));
    			add_location(div, file$c, 7, 2, 136);
    			attr_dev(td, "class", "color-contrast-table__color");
    			add_location(td, file$c, 6, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, div);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1 && t_value !== (t_value = (/*color*/ ctx[0].score !== "fail"
    			? /*color*/ ctx[0].score
    			: "X") + "")) set_data_dev(t, t_value);

    			if (dirty & /*color*/ 1 && div_title_value !== (div_title_value = `${/*color*/ ctx[0].ratio} : 1`)) {
    				attr_dev(div, "title", div_title_value);
    			}

    			if (dirty & /*color*/ 1 && div_class_value !== (div_class_value = /*color*/ ctx[0].score !== "fail"
    			? "color-contrast-table__color-block"
    			: "color-contrast-table__color-block color-contrast-table__color-block--fail")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div, "background", /*color*/ ctx[0].value);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div, "color", getLabelColor(/*color*/ ctx[0].value));
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { color = {} } = $$props;
    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Color> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Color", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ color, getLabelColor });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color];
    }

    class Color extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Color",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get color() {
    		throw new Error("<Color>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Color>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/color-contrast-table-svelte/src/row.svelte generated by Svelte v3.24.1 */
    const file$d = "node_modules/color-contrast-table-svelte/src/row.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (17:2) {#each color.combinationScores as color, index}
    function create_each_block$3(ctx) {
    	let color_1;
    	let current;

    	color_1 = new Color({
    			props: { color: /*color*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(color_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(color_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const color_1_changes = {};
    			if (dirty & /*color*/ 1) color_1_changes.color = /*color*/ ctx[0];
    			color_1.$set(color_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(color_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(color_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(color_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(17:2) {#each color.combinationScores as color, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let tr;
    	let header;
    	let t;
    	let current;
    	const header_spread_levels = [/*$$props*/ ctx[1]];
    	let header_props = {};

    	for (let i = 0; i < header_spread_levels.length; i += 1) {
    		header_props = assign(header_props, header_spread_levels[i]);
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	let each_value = /*color*/ ctx[0].combinationScores;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			create_component(header.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "class", "color-contrast-table__row");
    			set_style(tr, "background", /*color*/ ctx[0].value);
    			set_style(tr, "color", /*color*/ ctx[0].value);
    			add_location(tr, file$d, 7, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			mount_component(header, tr, null);
    			append_dev(tr, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = (dirty & /*$$props*/ 2)
    			? get_spread_update(header_spread_levels, [get_spread_object(/*$$props*/ ctx[1])])
    			: {};

    			header.$set(header_changes);

    			if (dirty & /*color*/ 1) {
    				each_value = /*color*/ ctx[0].combinationScores;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(tr, "background", /*color*/ ctx[0].value);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(tr, "color", /*color*/ ctx[0].value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(header);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { color = {} } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Row", $$slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("color" in $$new_props) $$invalidate(0, color = $$new_props.color);
    	};

    	$$self.$capture_state = () => ({ color, Header, Color });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ("color" in $$props) $$invalidate(0, color = $$new_props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [color, $$props];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get color() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/color-contrast-table-svelte/src/table.svelte generated by Svelte v3.24.1 */
    const file$e = "node_modules/color-contrast-table-svelte/src/table.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (15:4) {#each colors as color, index}
    function create_each_block$4(ctx) {
    	let row;
    	let current;
    	const row_spread_levels = [{ index: /*index*/ ctx[6] }, { color: /*color*/ ctx[4] }, /*props*/ ctx[2]];
    	let row_props = {};

    	for (let i = 0; i < row_spread_levels.length; i += 1) {
    		row_props = assign(row_props, row_spread_levels[i]);
    	}

    	row = new Row({ props: row_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = (dirty & /*colors, props*/ 5)
    			? get_spread_update(row_spread_levels, [
    					row_spread_levels[0],
    					dirty & /*colors*/ 1 && { color: /*color*/ ctx[4] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(15:4) {#each colors as color, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let table;
    	let tbody;
    	let current;
    	let each_value = /*colors*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tbody, file$e, 13, 2, 201);
    			attr_dev(table, "class", "color-contrast-table");
    			toggle_class(table, "use-styles", /*useStyles*/ ctx[1]);
    			add_location(table, file$e, 9, 0, 128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*colors, props*/ 5) {
    				each_value = /*colors*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*useStyles*/ 2) {
    				toggle_class(table, "use-styles", /*useStyles*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	const omit_props_names = ["colors","useStyles"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { colors = [] } = $$props;
    	let { useStyles } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Table", $$slots, []);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("colors" in $$new_props) $$invalidate(0, colors = $$new_props.colors);
    		if ("useStyles" in $$new_props) $$invalidate(1, useStyles = $$new_props.useStyles);
    	};

    	$$self.$capture_state = () => ({ colors, useStyles, Row, props });

    	$$self.$inject_state = $$new_props => {
    		if ("colors" in $$props) $$invalidate(0, colors = $$new_props.colors);
    		if ("useStyles" in $$props) $$invalidate(1, useStyles = $$new_props.useStyles);
    		if ("props" in $$props) $$invalidate(2, props = $$new_props.props);
    	};

    	let props;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(2, props = $$restProps);
    	};

    	return [colors, useStyles, props];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { colors: 0, useStyles: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*useStyles*/ ctx[1] === undefined && !("useStyles" in props)) {
    			console.warn("<Table> was created without expected prop 'useStyles'");
    		}
    	}

    	get colors() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useStyles() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useStyles(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/color-contrast-table-svelte/src/styles.svelte generated by Svelte v3.24.1 */

    function create_fragment$p(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Styles> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Styles", $$slots, []);
    	return [];
    }

    class Styles extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Styles",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* node_modules/color-contrast-table-svelte/src/chart.svelte generated by Svelte v3.24.1 */

    function create_fragment$q(ctx) {
    	let styles;
    	let t;
    	let table;
    	let current;
    	styles = new Styles({ $$inline: true });

    	table = new Table({
    			props: {
    				useStyles: /*useStyles*/ ctx[1],
    				colors: /*colors*/ ctx[0],
    				editNames: !!/*onNamesChange*/ ctx[4] || !!/*editNames*/ ctx[2],
    				editValues: !!/*onValuesChange*/ ctx[5] || !!/*editValues*/ ctx[3],
    				onNamesChange: /*onNamesChange*/ ctx[4],
    				onValuesChange: /*onValuesChange*/ ctx[5],
    				onInputBlur: /*onInputBlur*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(styles.$$.fragment);
    			t = space();
    			create_component(table.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(styles, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const table_changes = {};
    			if (dirty & /*useStyles*/ 2) table_changes.useStyles = /*useStyles*/ ctx[1];
    			if (dirty & /*colors*/ 1) table_changes.colors = /*colors*/ ctx[0];
    			if (dirty & /*onNamesChange, editNames*/ 20) table_changes.editNames = !!/*onNamesChange*/ ctx[4] || !!/*editNames*/ ctx[2];
    			if (dirty & /*onValuesChange, editValues*/ 40) table_changes.editValues = !!/*onValuesChange*/ ctx[5] || !!/*editValues*/ ctx[3];
    			if (dirty & /*onNamesChange*/ 16) table_changes.onNamesChange = /*onNamesChange*/ ctx[4];
    			if (dirty & /*onValuesChange*/ 32) table_changes.onValuesChange = /*onValuesChange*/ ctx[5];
    			if (dirty & /*onInputBlur*/ 64) table_changes.onInputBlur = /*onInputBlur*/ ctx[6];
    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(styles.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(styles.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(styles, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { colors = [] } = $$props;
    	let { useStyles = false } = $$props;
    	let { editNames } = $$props;
    	let { editValues } = $$props;
    	let { onNamesChange } = $$props;
    	let { onValuesChange } = $$props;
    	let { onInputBlur } = $$props;
    	colorArray.set(colors);
    	colorArray.subscribe(value => $$invalidate(0, colors = value));

    	const writable_props = [
    		"colors",
    		"useStyles",
    		"editNames",
    		"editValues",
    		"onNamesChange",
    		"onValuesChange",
    		"onInputBlur"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chart> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Chart", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("colors" in $$props) $$invalidate(0, colors = $$props.colors);
    		if ("useStyles" in $$props) $$invalidate(1, useStyles = $$props.useStyles);
    		if ("editNames" in $$props) $$invalidate(2, editNames = $$props.editNames);
    		if ("editValues" in $$props) $$invalidate(3, editValues = $$props.editValues);
    		if ("onNamesChange" in $$props) $$invalidate(4, onNamesChange = $$props.onNamesChange);
    		if ("onValuesChange" in $$props) $$invalidate(5, onValuesChange = $$props.onValuesChange);
    		if ("onInputBlur" in $$props) $$invalidate(6, onInputBlur = $$props.onInputBlur);
    	};

    	$$self.$capture_state = () => ({
    		colors,
    		useStyles,
    		editNames,
    		editValues,
    		onNamesChange,
    		onValuesChange,
    		onInputBlur,
    		generateChart: colorContrastTable,
    		colorArray,
    		Table,
    		Styles
    	});

    	$$self.$inject_state = $$props => {
    		if ("colors" in $$props) $$invalidate(0, colors = $$props.colors);
    		if ("useStyles" in $$props) $$invalidate(1, useStyles = $$props.useStyles);
    		if ("editNames" in $$props) $$invalidate(2, editNames = $$props.editNames);
    		if ("editValues" in $$props) $$invalidate(3, editValues = $$props.editValues);
    		if ("onNamesChange" in $$props) $$invalidate(4, onNamesChange = $$props.onNamesChange);
    		if ("onValuesChange" in $$props) $$invalidate(5, onValuesChange = $$props.onValuesChange);
    		if ("onInputBlur" in $$props) $$invalidate(6, onInputBlur = $$props.onInputBlur);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*colors*/ 1) {
    			 $$invalidate(0, colors = colorContrastTable(colors));
    		}
    	};

    	return [
    		colors,
    		useStyles,
    		editNames,
    		editValues,
    		onNamesChange,
    		onValuesChange,
    		onInputBlur
    	];
    }

    class Chart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {
    			colors: 0,
    			useStyles: 1,
    			editNames: 2,
    			editValues: 3,
    			onNamesChange: 4,
    			onValuesChange: 5,
    			onInputBlur: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chart",
    			options,
    			id: create_fragment$q.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*editNames*/ ctx[2] === undefined && !("editNames" in props)) {
    			console.warn("<Chart> was created without expected prop 'editNames'");
    		}

    		if (/*editValues*/ ctx[3] === undefined && !("editValues" in props)) {
    			console.warn("<Chart> was created without expected prop 'editValues'");
    		}

    		if (/*onNamesChange*/ ctx[4] === undefined && !("onNamesChange" in props)) {
    			console.warn("<Chart> was created without expected prop 'onNamesChange'");
    		}

    		if (/*onValuesChange*/ ctx[5] === undefined && !("onValuesChange" in props)) {
    			console.warn("<Chart> was created without expected prop 'onValuesChange'");
    		}

    		if (/*onInputBlur*/ ctx[6] === undefined && !("onInputBlur" in props)) {
    			console.warn("<Chart> was created without expected prop 'onInputBlur'");
    		}
    	}

    	get colors() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useStyles() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useStyles(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editNames() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editNames(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editValues() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editValues(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onNamesChange() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNamesChange(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onValuesChange() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onValuesChange(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onInputBlur() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onInputBlur(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/[owner]/[palette].svelte generated by Svelte v3.24.1 */
    const file$f = "src/pages/[owner]/[palette].svelte";

    // (139:1) {:catch error}
    function create_catch_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("uh oh, no palette with that name.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(139:1) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (128:1) {:then data}
    function create_then_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*colors*/ ctx[2] && /*colors*/ ctx[2].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(128:1) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (136:2) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "uh oh, this palette doesn't have any colors yet.";
    			add_location(p, file$f, 136, 3, 2972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(136:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (129:2) {#if colors && colors.length}
    function create_if_block$5(ctx) {
    	let chart;
    	let current;

    	chart = new Chart({
    			props: {
    				useStyles: true,
    				editNames: /*editting*/ ctx[3],
    				editValues: /*editting*/ ctx[3],
    				colors: /*colors*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chart, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chart_changes = {};
    			if (dirty & /*editting*/ 8) chart_changes.editNames = /*editting*/ ctx[3];
    			if (dirty & /*editting*/ 8) chart_changes.editValues = /*editting*/ ctx[3];
    			if (dirty & /*colors*/ 4) chart_changes.colors = /*colors*/ ctx[2];
    			chart.$set(chart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(129:2) {#if colors && colors.length}",
    		ctx
    	});

    	return block;
    }

    // (126:14)    <Loading />  {:then data}
    function create_pending_block(ctx) {
    	let loading;
    	let current;
    	loading = new Loading_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(126:14)    <Loading />  {:then data}",
    		ctx
    	});

    	return block;
    }

    // (125:0) <Layout owner={ownerData} palette={paletteData}>
    function create_default_slot$5(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 5,
    		error: 14,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*data*/ ctx[5], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[5] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(125:0) <Layout owner={ownerData} palette={paletteData}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let title_value;
    	let t;
    	let layout;
    	let current;
    	document.title = title_value = "" + (/*palette*/ ctx[4] + " | color-contrast-table");

    	layout = new Layout({
    			props: {
    				owner: /*ownerData*/ ctx[0],
    				palette: /*paletteData*/ ctx[1],
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*palette*/ 16) && title_value !== (title_value = "" + (/*palette*/ ctx[4] + " | color-contrast-table"))) {
    				document.title = title_value;
    			}

    			const layout_changes = {};
    			if (dirty & /*ownerData*/ 1) layout_changes.owner = /*ownerData*/ ctx[0];
    			if (dirty & /*paletteData*/ 2) layout_changes.palette = /*paletteData*/ ctx[1];

    			if (dirty & /*$$scope, editting, colors*/ 32780) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let $params;
    	validate_store(params, "params");
    	component_subscribe($$self, params, $$value => $$invalidate(8, $params = $$value));
    	const { owner, palette } = $params;

    	const query = `
    *[_type == 'owner' && slug == $owner] {
      name,
      slug,
      _id,
      'palettes': *[_type == 'palette' && owner._ref == ^._id && slug == $palette] {
        title,
        slug,
        _id,
        colors
      }
    }
  `;

    	const queryArgs = { owner, palette };
    	let ownerData;
    	let paletteData;
    	let colors;

    	const getData = async () => {
    		return client.fetch(query, queryArgs).then(response => {
    			if (response === []) ; else {
    				$$invalidate(0, ownerData = $$invalidate(0, ownerData = {
    					name: response[0].name,
    					slug: response[0].slug,
    					id: response[0]._id
    				}));

    				$$invalidate(1, paletteData = {
    					title: response[0].palettes[0].title,
    					slug: response[0].palettes[0].slug,
    					id: response[0].palettes[0]._id
    				});

    				($$invalidate(2, colors = response[0].palettes[0].colors
    				? response[0].palettes[0].colors.map(color => {
    						return { name: color.name, value: color.value };
    					})
    				: []), currentData.user = ownerData._id);

    				currentData.palette = paletteData._id;
    				currentData.colors = colors;
    			}
    		}).catch(err => this.error(500, err));
    	};

    	const data = getData();
    	let action;

    	activeAction.subscribe(currentAction => {
    		$$invalidate(7, action = currentAction);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<U5Bpaletteu5D> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("U5Bpaletteu5D", $$slots, []);

    	$$self.$capture_state = () => ({
    		params,
    		client,
    		currentData,
    		actions,
    		activeAction,
    		Layout,
    		Loading: Loading_1,
    		Chart,
    		owner,
    		palette,
    		query,
    		queryArgs,
    		ownerData,
    		paletteData,
    		colors,
    		getData,
    		data,
    		action,
    		$params,
    		buttons,
    		editting
    	});

    	$$self.$inject_state = $$props => {
    		if ("ownerData" in $$props) $$invalidate(0, ownerData = $$props.ownerData);
    		if ("paletteData" in $$props) $$invalidate(1, paletteData = $$props.paletteData);
    		if ("colors" in $$props) $$invalidate(2, colors = $$props.colors);
    		if ("action" in $$props) $$invalidate(7, action = $$props.action);
    		if ("buttons" in $$props) $$invalidate(9, buttons = $$props.buttons);
    		if ("editting" in $$props) $$invalidate(3, editting = $$props.editting);
    	};

    	let buttons;
    	let editting;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*action*/ 128) {
    			 $$invalidate(9, buttons = [
    				{
    					text: "add a color",
    					title: "addColor",
    					icon: "add",
    					action: () => activeAction.set("addColor")
    				},
    				action === "editColors"
    				? {
    						text: "save",
    						icon: "save",
    						active: true,
    						action: () => activeAction.set("")
    					}
    				: {
    						text: "edit colors",
    						title: "editColors",
    						icon: "edit",
    						action: () => activeAction.set("editColors")
    					},
    				{
    					text: "see JSON",
    					title: "seeCode",
    					icon: "code",
    					action: () => activeAction.set("seeCode")
    				}
    			]); // {
    			// 	text: 'download svg',
    			//  title: 'downloadSvg', 
    			// 	icon: 'download',
    		}

    		if ($$self.$$.dirty & /*buttons*/ 512) {
    			// 	action: () => activeAction.set('downloadSvg')
    			// }
    			 actions.set([...buttons]);
    		}

    		if ($$self.$$.dirty & /*action*/ 128) {
    			 $$invalidate(3, editting = action === "editColors");
    		}
    	};

    	return [ownerData, paletteData, colors, editting, palette, data];
    }

    class U5Bpaletteu5D extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "U5Bpaletteu5D",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/pages/[owner]/index.svelte generated by Svelte v3.24.1 */
    const file$g = "src/pages/[owner]/index.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (100:1) {:catch error}
    function create_catch_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("uh oh, no user with that name.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(100:1) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (76:1) {:then data}
    function create_then_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*palettes*/ ctx[1] && /*palettes*/ ctx[1].length) return create_if_block$6;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(76:1) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (97:2) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "uh oh, you have no color palettes. create one!";
    			add_location(p, file$g, 97, 3, 2059);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(97:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:2) {#if palettes && palettes.length}
    function create_if_block$6(ctx) {
    	let ul;
    	let each_value = /*palettes*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$g, 77, 3, 1507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$url, owner, palettes*/ 14) {
    				each_value = /*palettes*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(77:2) {#if palettes && palettes.length}",
    		ctx
    	});

    	return block;
    }

    // (87:16) {#if palette.colors?.length }
    function create_if_block_1$4(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*palette*/ ctx[10].colors;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*palettes*/ 2) {
    				each_value_1 = /*palette*/ ctx[10].colors;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(87:16) {#if palette.colors?.length }",
    		ctx
    	});

    	return block;
    }

    // (88:18) {#each palette.colors as color}
    function create_each_block_1$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			set_style(span, "background-color", /*color*/ ctx[13].value);
    			attr_dev(span, "class", "svelte-vk4qvx");
    			add_location(span, file$g, 88, 20, 1867);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*palettes*/ 2) {
    				set_style(span, "background-color", /*color*/ ctx[13].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(88:18) {#each palette.colors as color}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#each palettes as palette}
    function create_each_block$5(ctx) {
    	let li;
    	let a;
    	let span;
    	let t0_value = /*palette*/ ctx[10].title + "";
    	let t0;
    	let t1;
    	let div;
    	let a_href_value;
    	let t2;
    	let if_block = /*palette*/ ctx[10].colors?.length && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(span, "class", "svelte-vk4qvx");
    			add_location(span, file$g, 84, 14, 1702);
    			attr_dev(div, "class", "svelte-vk4qvx");
    			add_location(div, file$g, 85, 14, 1745);

    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[2]("/:owner/:palette", {
    				owner: /*owner*/ ctx[3],
    				palette: /*palette*/ ctx[10].slug
    			}));

    			add_location(a, file$g, 80, 12, 1571);
    			add_location(li, file$g, 79, 10, 1554);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, span);
    			append_dev(span, t0);
    			append_dev(a, t1);
    			append_dev(a, div);
    			if (if_block) if_block.m(div, null);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*palettes*/ 2 && t0_value !== (t0_value = /*palette*/ ctx[10].title + "")) set_data_dev(t0, t0_value);

    			if (/*palette*/ ctx[10].colors?.length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$url, palettes*/ 6 && a_href_value !== (a_href_value = /*$url*/ ctx[2]("/:owner/:palette", {
    				owner: /*owner*/ ctx[3],
    				palette: /*palette*/ ctx[10].slug
    			}))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(79:4) {#each palettes as palette}",
    		ctx
    	});

    	return block;
    }

    // (74:14)    <Loading />  {:then data}
    function create_pending_block$1(ctx) {
    	let loading;
    	let current;
    	loading = new Loading_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(74:14)    <Loading />  {:then data}",
    		ctx
    	});

    	return block;
    }

    // (73:0) <Layout owner={ownerData}>
    function create_default_slot$6(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 4,
    		error: 16,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*data*/ ctx[4], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[4] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(73:0) <Layout owner={ownerData}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let title_value;
    	let t;
    	let layout;
    	let current;
    	document.title = title_value = "" + (/*owner*/ ctx[3] + " | color-contrast-table");

    	layout = new Layout({
    			props: {
    				owner: /*ownerData*/ ctx[0],
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*owner*/ 8) && title_value !== (title_value = "" + (/*owner*/ ctx[3] + " | color-contrast-table"))) {
    				document.title = title_value;
    			}

    			const layout_changes = {};
    			if (dirty & /*ownerData*/ 1) layout_changes.owner = /*ownerData*/ ctx[0];

    			if (dirty & /*$$scope, palettes, $url*/ 131078) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let $params;
    	let $url;
    	validate_store(params, "params");
    	component_subscribe($$self, params, $$value => $$invalidate(6, $params = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	const { owner } = $params;

    	const query = `
    *[_type == 'owner' && slug == $owner] {
      name,
      slug,
      _id,
      'palettes': *[_type == 'palette' && owner._ref == ^._id] {
        title,
        slug,
        colors
      }
    }
  `;

    	const queryArgs = { owner };
    	let ownerData;
    	let palettes;

    	const getData = async () => {
    		return client.fetch(query, queryArgs).then(response => {
    			if (response === []) ; else {
    				$$invalidate(0, ownerData = {
    					name: response[0].name,
    					slug: response[0].slug
    				});

    				$$invalidate(1, palettes = response[0].palettes);
    				currentData.user = response[0]._id;
    			}
    		}).catch(err => this.error(500, err));
    	};

    	const data = getData();

    	actions.set([
    		{
    			text: "add a color palette",
    			title: "addPalette",
    			icon: "add",
    			action: () => activeAction.set("addPalette")
    		}
    	]);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<U5Bowneru5D> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("U5Bowneru5D", $$slots, []);

    	$$self.$capture_state = () => ({
    		url,
    		params,
    		client,
    		currentData,
    		actions,
    		activeAction,
    		Layout,
    		Loading: Loading_1,
    		owner,
    		query,
    		queryArgs,
    		ownerData,
    		palettes,
    		getData,
    		data,
    		$params,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("ownerData" in $$props) $$invalidate(0, ownerData = $$props.ownerData);
    		if ("palettes" in $$props) $$invalidate(1, palettes = $$props.palettes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ownerData, palettes, $url, owner, data];
    }

    class U5Bowneru5D extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "U5Bowneru5D",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.24.1 */
    const file$h = "src/pages/index.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (50:1) {:catch error}
    function create_catch_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("error?");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(50:1) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (36:1) {:then data}
    function create_then_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*owners*/ ctx[0] && /*owners*/ ctx[0].length) return create_if_block$7;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(36:1) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (47:2) {:else}
    function create_else_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "uh oh, there are no users. create one!";
    			add_location(p, file$h, 47, 3, 919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(47:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (37:2) {#if owners && owners.length}
    function create_if_block$7(ctx) {
    	let ul;
    	let each_value = /*owners*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$h, 37, 3, 732);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$url, owners*/ 3) {
    				each_value = /*owners*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(37:2) {#if owners && owners.length}",
    		ctx
    	});

    	return block;
    }

    // (39:4) {#each owners as owner}
    function create_each_block$6(ctx) {
    	let li;
    	let a;
    	let span;
    	let t0_value = /*owner*/ ctx[4].name + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(span, file$h, 41, 7, 836);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[1]("/:owner", { owner: /*owner*/ ctx[4].slug }));
    			add_location(a, file$h, 40, 6, 781);
    			add_location(li, file$h, 39, 5, 770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, span);
    			append_dev(span, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*owners*/ 1 && t0_value !== (t0_value = /*owner*/ ctx[4].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$url, owners*/ 3 && a_href_value !== (a_href_value = /*$url*/ ctx[1]("/:owner", { owner: /*owner*/ ctx[4].slug }))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(39:4) {#each owners as owner}",
    		ctx
    	});

    	return block;
    }

    // (34:14)    <Loading />  {:then data}
    function create_pending_block$2(ctx) {
    	let loading;
    	let current;
    	loading = new Loading_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loading.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loading, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loading.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loading.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loading, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(34:14)    <Loading />  {:then data}",
    		ctx
    	});

    	return block;
    }

    // (33:0) <Layout>
    function create_default_slot$7(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 2,
    		error: 7,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*data*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[2] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(33:0) <Layout>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let t;
    	let layout;
    	let current;

    	layout = new Layout({
    			props: {
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(layout.$$.fragment);
    			document.title = "color-contrast-table";
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layout_changes = {};

    			if (dirty & /*$$scope, owners, $url*/ 259) {
    				layout_changes.$$scope = { dirty, ctx };
    			}

    			layout.$set(layout_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	let owners;

    	const getData = async () => {
    		return client.fetch("*[_type == \"owner\"]").then(response => {
    			$$invalidate(0, owners = response);
    		}).catch(err => this.error(500, err));
    	};

    	const data = getData();

    	actions.set([
    		{
    			title: "addUser",
    			text: "add a user",
    			icon: "add",
    			action: () => activeAction.set("addUser")
    		}
    	]);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pages", $$slots, []);

    	$$self.$capture_state = () => ({
    		url,
    		client,
    		actions,
    		activeAction,
    		Layout,
    		Loading: Loading_1,
    		owners,
    		getData,
    		data,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("owners" in $$props) $$invalidate(0, owners = $$props.owners);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [owners, $url, data];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    //tree
    const _tree = {
      "name": "root",
      "filepath": "/",
      "root": true,
      "ownMeta": {},
      "absolutePath": "src/pages",
      "children": [
        {
          "isFile": true,
          "isDir": false,
          "file": "_fallback.svelte",
          "filepath": "/_fallback.svelte",
          "name": "_fallback",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/ryanfiller/Dev/personal/color-contrast-site/web/src/pages/_fallback.svelte",
          "importPath": "../../../../src/pages/_fallback.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": true,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/_fallback",
          "id": "__fallback",
          "component": () => Fallback
        },
        {
          "isFile": false,
          "isDir": true,
          "file": "[owner]",
          "filepath": "/[owner]",
          "name": "[owner]",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/ryanfiller/Dev/personal/color-contrast-site/web/src/pages/[owner]",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "[palette].svelte",
              "filepath": "/[owner]/[palette].svelte",
              "name": "[palette]",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/ryanfiller/Dev/personal/color-contrast-site/web/src/pages/[owner]/[palette].svelte",
              "importPath": "../../../../src/pages/[owner]/[palette].svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": false,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/:owner/:palette",
              "id": "__owner__palette",
              "component": () => U5Bpaletteu5D
            },
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/[owner]/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/ryanfiller/Dev/personal/color-contrast-site/web/src/pages/[owner]/index.svelte",
              "importPath": "../../../../src/pages/[owner]/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "preload": false,
                "prerender": true,
                "precache-order": false,
                "precache-proximity": true,
                "recursive": true
              },
              "path": "/:owner/index",
              "id": "__owner_index",
              "component": () => U5Bowneru5D
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/:owner"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/ryanfiller/Dev/personal/color-contrast-site/web/src/pages/index.svelte",
          "importPath": "../../../../src/pages/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/index",
          "id": "_index",
          "component": () => Pages
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/"
    };


    const {tree, routes: routes$1} = buildClientTree(_tree);

    /* src/app.svelte generated by Svelte v3.24.1 */

    function create_fragment$u(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Router, routes: routes$1 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
