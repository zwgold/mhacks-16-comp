
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
            set_current_component(null);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
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

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Toolbar.svelte generated by Svelte v3.29.0 */
    const file = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Toolbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (14:33) 
    function create_if_block_2(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Check");
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, "Check");
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "svelte-e4q29q");
    			add_location(button, file, 14, 6, 474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(14:33) ",
    		ctx
    	});

    	return block;
    }

    // (12:34) 
    function create_if_block_1(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Reveal");
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, "Reveal");
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "svelte-e4q29q");
    			add_location(button, file, 12, 6, 363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(12:34) ",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if action === 'clear'}
    function create_if_block(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Clear");
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t = claim_text(button_nodes, "Clear");
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button, "class", "svelte-e4q29q");
    			add_location(button, file, 10, 6, 253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:4) {#if action === 'clear'}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#each actions as action}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*action*/ ctx[5] === "clear") return create_if_block;
    		if (/*action*/ ctx[5] === "reveal") return create_if_block_1;
    		if (/*action*/ ctx[5] === "check") return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:2) {#each actions as action}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_value = /*actions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "toolbar svelte-e4q29q");
    			add_location(div, file, 7, 0, 168);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, actions*/ 3) {
    				each_value = /*actions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Toolbar", slots, []);
    	const dispatch = createEventDispatcher();
    	let { actions = ["clear", "reveal", "check"] } = $$props;
    	const writable_props = ["actions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toolbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("event", "clear");
    	const click_handler_1 = () => dispatch("event", "reveal");
    	const click_handler_2 = () => dispatch("event", "check");

    	$$self.$$set = $$props => {
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    	};

    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch, actions });

    	$$self.$inject_state = $$props => {
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [actions, dispatch, click_handler, click_handler_1, click_handler_2];
    }

    class Toolbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { actions: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolbar",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get actions() {
    		throw new Error("<Toolbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actions(value) {
    		throw new Error("<Toolbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var standard = [{
    	"row": 0,
    	"value": "q"
    }, {
    	"row": 0,
    	"value": "w"
    }, {
    	"row": 0,
    	"value": "e"
    }, {
    	"row": 0,
    	"value": "r"
    }, {
    	"row": 0,
    	"value": "t"
    }, {
    	"row": 0,
    	"value": "y"
    }, {
    	"row": 0,
    	"value": "u"
    },  {
    	"row": 0,
    	"value": "i"
    },  {
    	"row": 0,
    	"value": "o"
    },  {
    	"row": 0,
    	"value": "p"
    }, {
    	"row": 1,
    	"value": "a"
    }, {
    	"row": 1,
    	"value": "s"
    }, {
    	"row": 1,
    	"value": "d"
    }, {
    	"row": 1,
    	"value": "f"
    }, {
    	"row": 1,
    	"value": "g"
    }, {
    	"row": 1,
    	"value": "h"
    }, {
    	"row": 1,
    	"value": "j"
    }, {
    	"row": 1,
    	"value": "k"
    }, {
    	"row": 1,
    	"value": "l"
    }, {
    	"row": 2,
    	"value": "Shift",
    }, {
    	"row": 2,
    	"value": "z"
    }, {
    	"row": 2,
    	"value": "x"
    }, {
    	"row": 2,
    	"value": "c"
    }, {
    	"row": 2,
    	"value": "v"
    }, {
    	"row": 2,
    	"value": "b"
    }, {
    	"row": 2,
    	"value": "n"
    }, {
    	"row": 2,
    	"value": "m"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }, {
    	"row": 3,
    	"value": "Page1",
    },  {
    	"row": 3,
    	"value": ",",
    },  {
    	"row": 3,
    	"value": "Space",
    },  {
    	"row": 3,
    	"value": ".",
    },  {
    	"row": 3,
    	"value": "Enter",
    }, {
    	"row": 0,
    	"value": "1",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "2",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "3",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "4",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "5",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "6",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "7",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "8",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "9",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "0",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "!",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "@",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "#",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "$",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "%",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "^",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "&",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "*",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "(",
    	"page": 1
    }, {
    	"row": 1,
    	"value": ")",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "-",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "_",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "=",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "+",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ";",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ":",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "'",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "\"",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "<",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ">",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "Page0",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "/",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "?",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "[",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "]",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "{",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "}",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "|",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "\\",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "~",
    	"page": 1
    }];

    var crossword = [{
    	"row": 0,
    	"value": "Q"
    }, {
    	"row": 0,
    	"value": "W"
    }, {
    	"row": 0,
    	"value": "E"
    }, {
    	"row": 0,
    	"value": "R"
    }, {
    	"row": 0,
    	"value": "T"
    }, {
    	"row": 0,
    	"value": "Y"
    }, {
    	"row": 0,
    	"value": "U"
    },  {
    	"row": 0,
    	"value": "I"
    },  {
    	"row": 0,
    	"value": "O"
    },  {
    	"row": 0,
    	"value": "P"
    }, {
    	"row": 1,
    	"value": "A"
    }, {
    	"row": 1,
    	"value": "S"
    }, {
    	"row": 1,
    	"value": "D"
    }, {
    	"row": 1,
    	"value": "F"
    }, {
    	"row": 1,
    	"value": "G"
    }, {
    	"row": 1,
    	"value": "H"
    }, {
    	"row": 1,
    	"value": "J"
    }, {
    	"row": 1,
    	"value": "K"
    }, {
    	"row": 1,
    	"value": "L"
    }, {
    	"row": 2,
    	"value": "Z"
    }, {
    	"row": 2,
    	"value": "X"
    }, {
    	"row": 2,
    	"value": "C"
    }, {
    	"row": 2,
    	"value": "V"
    }, {
    	"row": 2,
    	"value": "B"
    }, {
    	"row": 2,
    	"value": "N"
    }, {
    	"row": 2,
    	"value": "M"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }];

    var backspaceSVG = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-delete"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>`;

    var enterSVG = `<svg width="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-down-left"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>`;

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/node_modules/svelte-keyboard/src/Keyboard.svelte generated by Svelte v3.29.0 */
    const file$1 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/node_modules/svelte-keyboard/src/Keyboard.svelte";

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i].value;
    	child_ctx[32] = list[i].display;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    // (93:14) {:else}
    function create_else_block(ctx) {
    	let t_value = /*display*/ ctx[32] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData*/ 4 && t_value !== (t_value = /*display*/ ctx[32] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(93:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (91:14) {#if display.includes('<svg')}
    function create_if_block$1(ctx) {
    	let html_tag;
    	let raw_value = /*display*/ ctx[32] + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			html_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData*/ 4 && raw_value !== (raw_value = /*display*/ ctx[32] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(91:14) {#if display.includes('<svg')}",
    		ctx
    	});

    	return block;
    }

    // (84:10) {#each keys as { value, display }}
    function create_each_block_2(ctx) {
    	let button;
    	let show_if;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*rowData*/ 4) show_if = !!/*display*/ ctx[32].includes("<svg");
    		if (show_if) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, [-1]);
    	let if_block = current_block_type(ctx);

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[7](/*value*/ ctx[31], ...args);
    	}

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[8](/*value*/ ctx[31], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", { style: true, class: true });
    			var button_nodes = children(button);
    			if_block.l(button_nodes);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_style(button, "--w", /*percentWidth*/ ctx[3]);
    			attr_dev(button, "class", button_class_value = "" + (/*style*/ ctx[0] + " key--" + /*value*/ ctx[31] + " svelte-n3ouos"));
    			toggle_class(button, "single", /*value*/ ctx[31].length === 1);
    			add_location(button, file$1, 84, 12, 2404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "touchstart", touchstart_handler, false, false, false),
    					listen_dev(button, "mousedown", mousedown_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty[0] & /*percentWidth*/ 8) {
    				set_style(button, "--w", /*percentWidth*/ ctx[3]);
    			}

    			if (dirty[0] & /*style, rowData*/ 5 && button_class_value !== (button_class_value = "" + (/*style*/ ctx[0] + " key--" + /*value*/ ctx[31] + " svelte-n3ouos"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*style, rowData, rowData*/ 5) {
    				toggle_class(button, "single", /*value*/ ctx[31].length === 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(84:10) {#each keys as { value, display }}",
    		ctx
    	});

    	return block;
    }

    // (82:6) {#each row as keys}
    function create_each_block_1(ctx) {
    	let div;
    	let div_class_value;
    	let each_value_2 = /*keys*/ ctx[28];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "row row--" + /*i*/ ctx[27] + " svelte-n3ouos");
    			add_location(div, file$1, 82, 8, 2320);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*percentWidth, style, rowData, onKey*/ 29) {
    				each_value_2 = /*keys*/ ctx[28];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(82:6) {#each row as keys}",
    		ctx
    	});

    	return block;
    }

    // (80:2) {#each rowData as row, i}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[25];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			t = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "page svelte-n3ouos");
    			toggle_class(div, "visible", /*i*/ ctx[27] === /*page*/ ctx[1]);
    			add_location(div, file$1, 80, 4, 2238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData, percentWidth, style, onKey*/ 29) {
    				each_value_1 = /*row*/ ctx[25];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*page*/ 2) {
    				toggle_class(div, "visible", /*i*/ ctx[27] === /*page*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(80:2) {#each rowData as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = /*rowData*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div_nodes);
    			}

    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "keyboard");
    			add_location(div, file$1, 78, 0, 2183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*page, rowData, percentWidth, style, onKey*/ 31) {
    				each_value = /*rowData*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Keyboard", slots, []);
    	const dispatch = createEventDispatcher();
    	let { custom } = $$props;
    	let { style = "" } = $$props;
    	let { layout = "standard" } = $$props;
    	let page = 0;
    	let shifted = false;
    	const layouts = { standard, crossword };

    	const swaps = {
    		Page0: "abc",
    		Page1: "?123",
    		Space: " ",
    		Shift: "abc",
    		Enter: enterSVG,
    		Backspace: backspaceSVG
    	};

    	const unique = arr => [...new Set(arr)];

    	function onKey(value, event) {
    		event.preventDefault();

    		if (value.includes("Page")) {
    			$$invalidate(1, page = +value.substr(-1));
    		} else if (value === "Shift") {
    			$$invalidate(9, shifted = !shifted);
    		} else {
    			let output = value;
    			if (shifted && alphabet.includes(value)) output = value.toUpperCase();
    			if (value === "Space") output = " ";
    			dispatch("keydown", output);
    		}

    		event.stopPropagation();
    		return false;
    	}

    	const writable_props = ["custom", "style", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	const touchstart_handler = (value, e) => onKey(value, e);
    	const mousedown_handler = (value, e) => onKey(value, e);

    	$$self.$$set = $$props => {
    		if ("custom" in $$props) $$invalidate(5, custom = $$props.custom);
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("layout" in $$props) $$invalidate(6, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		standard,
    		crossword,
    		backspaceSVG,
    		enterSVG,
    		dispatch,
    		custom,
    		style,
    		layout,
    		page,
    		shifted,
    		alphabet,
    		layouts,
    		swaps,
    		unique,
    		onKey,
    		rawData,
    		data,
    		page0,
    		page1,
    		rows0,
    		rows1,
    		rowData0,
    		rowData1,
    		rowData,
    		maxInRow0,
    		maxInRow1,
    		maxInRow,
    		percentWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("custom" in $$props) $$invalidate(5, custom = $$props.custom);
    		if ("style" in $$props) $$invalidate(0, style = $$props.style);
    		if ("layout" in $$props) $$invalidate(6, layout = $$props.layout);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    		if ("shifted" in $$props) $$invalidate(9, shifted = $$props.shifted);
    		if ("rawData" in $$props) $$invalidate(10, rawData = $$props.rawData);
    		if ("data" in $$props) $$invalidate(11, data = $$props.data);
    		if ("page0" in $$props) $$invalidate(12, page0 = $$props.page0);
    		if ("page1" in $$props) $$invalidate(13, page1 = $$props.page1);
    		if ("rows0" in $$props) $$invalidate(14, rows0 = $$props.rows0);
    		if ("rows1" in $$props) $$invalidate(15, rows1 = $$props.rows1);
    		if ("rowData0" in $$props) $$invalidate(16, rowData0 = $$props.rowData0);
    		if ("rowData1" in $$props) $$invalidate(17, rowData1 = $$props.rowData1);
    		if ("rowData" in $$props) $$invalidate(2, rowData = $$props.rowData);
    		if ("maxInRow0" in $$props) $$invalidate(18, maxInRow0 = $$props.maxInRow0);
    		if ("maxInRow1" in $$props) $$invalidate(19, maxInRow1 = $$props.maxInRow1);
    		if ("maxInRow" in $$props) $$invalidate(20, maxInRow = $$props.maxInRow);
    		if ("percentWidth" in $$props) $$invalidate(3, percentWidth = $$props.percentWidth);
    	};

    	let rawData;
    	let data;
    	let page0;
    	let page1;
    	let rows0;
    	let rows1;
    	let rowData0;
    	let rowData1;
    	let rowData;
    	let maxInRow0;
    	let maxInRow1;
    	let maxInRow;
    	let percentWidth;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*custom, layout*/ 96) {
    			 $$invalidate(10, rawData = custom || layouts[layout]);
    		}

    		if ($$self.$$.dirty[0] & /*rawData, shifted*/ 1536) {
    			 $$invalidate(11, data = rawData.map(d => {
    				let display = d.display;
    				if (swaps[d.value]) display = swaps[d.value];
    				if (!display) display = shifted ? d.value.toUpperCase() : d.value;
    				if (d.value === "Shift") display = shifted ? swaps[d.value] : swaps[d.value].toUpperCase();
    				return { ...d, display };
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 2048) {
    			 $$invalidate(12, page0 = data.filter(d => !d.page));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 2048) {
    			 $$invalidate(13, page1 = data.filter(d => d.page));
    		}

    		if ($$self.$$.dirty[0] & /*page0*/ 4096) {
    			 $$invalidate(14, rows0 = unique(page0.map(d => d.row)));
    		}

    		if ($$self.$$.dirty[0] & /*rows0*/ 16384) {
    			 (rows0.sort((a, b) => a - b));
    		}

    		if ($$self.$$.dirty[0] & /*page1*/ 8192) {
    			 $$invalidate(15, rows1 = unique(page1.map(d => d.row)));
    		}

    		if ($$self.$$.dirty[0] & /*rows1*/ 32768) {
    			 (rows1.sort((a, b) => a - b));
    		}

    		if ($$self.$$.dirty[0] & /*rows0, page0*/ 20480) {
    			 $$invalidate(16, rowData0 = rows0.map(r => page0.filter(k => k.row === r)));
    		}

    		if ($$self.$$.dirty[0] & /*rows0, page1*/ 24576) {
    			 $$invalidate(17, rowData1 = rows0.map(r => page1.filter(k => k.row === r)));
    		}

    		if ($$self.$$.dirty[0] & /*rowData0, rowData1*/ 196608) {
    			 $$invalidate(2, rowData = [rowData0, rowData1]);
    		}

    		if ($$self.$$.dirty[0] & /*rowData0*/ 65536) {
    			 $$invalidate(18, maxInRow0 = Math.max(...rowData0.map(r => r.length)));
    		}

    		if ($$self.$$.dirty[0] & /*rowData1*/ 131072) {
    			 $$invalidate(19, maxInRow1 = Math.max(...rowData1.map(r => r.length)));
    		}

    		if ($$self.$$.dirty[0] & /*maxInRow0, maxInRow1*/ 786432) {
    			 $$invalidate(20, maxInRow = Math.max(maxInRow0, maxInRow1));
    		}

    		if ($$self.$$.dirty[0] & /*maxInRow*/ 1048576) {
    			 $$invalidate(3, percentWidth = `${1 / maxInRow * 100}%`);
    		}
    	};

    	return [
    		style,
    		page,
    		rowData,
    		percentWidth,
    		onKey,
    		custom,
    		layout,
    		touchstart_handler,
    		mousedown_handler
    	];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { custom: 5, style: 0, layout: 6 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*custom*/ ctx[5] === undefined && !("custom" in props)) {
    			console.warn("<Keyboard> was created without expected prop 'custom'");
    		}
    	}

    	get custom() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var getSecondarilyFocusedCells = ({ cells, focusedDirection, focusedCell }) => {
      const dimension = focusedDirection == "across" ? "x" : "y";
      const otherDimension = focusedDirection == "across" ? "y" : "x";
      const start = focusedCell[dimension];

      const cellsWithDiff = cells
        .filter(
          (cell) =>
            // take out cells in other columns/rows
            cell[otherDimension] == focusedCell[otherDimension]
        )
        .map((cell) => ({
          ...cell,
          // how far is this cell from our focused cell?
          diff: start - cell[dimension],
        }));
        
    	cellsWithDiff.sort((a, b) => a.diff - b.diff);

      // highlight all cells in same row/column, without any breaks
      const diffs = cellsWithDiff.map((d) => d.diff);
      const indices = range(Math.min(...diffs), Math.max(...diffs)).map((i) =>
        diffs.includes(i) ? i : " "
      );
      const chunks = indices.join(",").split(", ,");
      const currentChunk = (
        chunks.find(
          (d) => d.startsWith("0,") || d.endsWith(",0") || d.includes(",0,")
        ) || ""
      )
        .split(",")
        .map((d) => +d);

      const secondarilyFocusedCellIndices = cellsWithDiff
        .filter((cell) => currentChunk.includes(cell.diff))
        .map((cell) => cell.index);
      return secondarilyFocusedCellIndices;
    };

    const range = (min, max) =>
      Array.from({ length: max - min + 1 }, (v, k) => k + min);

    var getCellAfterDiff = ({ diff, cells, direction, focusedCell }) => {
      const dimension = direction == "across" ? "x" : "y";
      const otherDimension = direction == "across" ? "y" : "x";
      const start = focusedCell[dimension];
      const absDiff = Math.abs(diff);
      const isDiffNegative = diff < 0;

      const cellsWithDiff = cells
        .filter(
          (cell) =>
            // take out cells in other columns/rows
            cell[otherDimension] == focusedCell[otherDimension] &&
            // take out cells in wrong direction
            (isDiffNegative ? cell[dimension] < start : cell[dimension] > start)
        )
        .map((cell) => ({
          ...cell,
          // how far is this cell from our focused cell?
          absDiff: Math.abs(start - cell[dimension]),
        }));

      cellsWithDiff.sort((a, b) => a.absDiff - b.absDiff);
      return cellsWithDiff[absDiff - 1];
    };

    function checkMobile() {
    	const devices = {
    		android: () => navigator.userAgent.match(/Android/i),

    		blackberry: () => navigator.userAgent.match(/BlackBerry/i),

    		ios: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),

    		opera: () => navigator.userAgent.match(/Opera Mini/i),

    		windows: () => navigator.userAgent.match(/IEMobile/i),
    	};

    	return devices.android() ||
    		devices.blackberry() ||
    		devices.ios() ||
    		devices.opera() ||
    		devices.windows();
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Cell.svelte generated by Svelte v3.29.0 */

    const file$2 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Cell.svelte";

    // (108:2) {#if showCheck && !correct}
    function create_if_block_1$1(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			this.h();
    		},
    		l: function claim(nodes) {
    			line = claim_element(
    				nodes,
    				"line",
    				{
    					x1: true,
    					y1: true,
    					x2: true,
    					y2: true,
    					class: true
    				},
    				1
    			);

    			children(line).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "y1", "1");
    			attr_dev(line, "x2", "1");
    			attr_dev(line, "y2", "0");
    			attr_dev(line, "class", "svelte-1veput");
    			add_location(line, file$2, 108, 4, 2459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(108:2) {#if showCheck && !correct}",
    		ctx
    	});

    	return block;
    }

    // (112:2) {#if value}
    function create_if_block$2(ctx) {
    	let text_1;
    	let t;
    	let text_1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(/*value*/ ctx[2]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			text_1 = claim_element(
    				nodes,
    				"text",
    				{
    					class: true,
    					x: true,
    					y: true,
    					"text-anchor": true
    				},
    				1
    			);

    			var text_1_nodes = children(text_1);
    			t = claim_text(text_1_nodes, /*value*/ ctx[2]);
    			text_1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(text_1, "class", "value svelte-1veput");
    			attr_dev(text_1, "x", "0.5");
    			attr_dev(text_1, "y", "0.9");
    			attr_dev(text_1, "text-anchor", "middle");
    			add_location(text_1, file$2, 112, 4, 2528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*value*/ 4) set_data_dev(t, /*value*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!text_1_transition) text_1_transition = create_bidirectional_transition(
    					text_1,
    					pop,
    					{
    						y: 5,
    						delay: /*changeDelay*/ ctx[5],
    						duration: /*isRevealing*/ ctx[6] ? 250 : 0
    					},
    					true
    				);

    				text_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!text_1_transition) text_1_transition = create_bidirectional_transition(
    				text_1,
    				pop,
    				{
    					y: 5,
    					delay: /*changeDelay*/ ctx[5],
    					duration: /*isRevealing*/ ctx[6] ? 250 : 0
    				},
    				false
    			);

    			text_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    			if (detaching && text_1_transition) text_1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(112:2) {#if value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let g;
    	let rect;
    	let if_block0_anchor;
    	let text_1;
    	let t;
    	let g_class_value;
    	let g_transform_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showCheck*/ ctx[11] && !/*correct*/ ctx[10] && create_if_block_1$1(ctx);
    	let if_block1 = /*value*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			text_1 = svg_element("text");
    			t = text(/*number*/ ctx[3]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			g = claim_element(
    				nodes,
    				"g",
    				{
    					class: true,
    					transform: true,
    					tabIndex: true
    				},
    				1
    			);

    			var g_nodes = children(g);
    			rect = claim_element(g_nodes, "rect", { width: true, height: true, class: true }, 1);
    			children(rect).forEach(detach_dev);
    			if (if_block0) if_block0.l(g_nodes);
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.l(g_nodes);

    			text_1 = claim_element(
    				g_nodes,
    				"text",
    				{
    					class: true,
    					x: true,
    					y: true,
    					"text-anchor": true
    				},
    				1
    			);

    			var text_1_nodes = children(text_1);
    			t = claim_text(text_1_nodes, /*number*/ ctx[3]);
    			text_1_nodes.forEach(detach_dev);
    			g_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(rect, "width", "1");
    			attr_dev(rect, "height", "1");
    			attr_dev(rect, "class", "svelte-1veput");
    			add_location(rect, file$2, 105, 2, 2389);
    			attr_dev(text_1, "class", "number svelte-1veput");
    			attr_dev(text_1, "x", "0.08");
    			attr_dev(text_1, "y", "0.3");
    			attr_dev(text_1, "text-anchor", "start");
    			add_location(text_1, file$2, 121, 2, 2733);
    			attr_dev(g, "class", g_class_value = "cell " + /*custom*/ ctx[4] + " cell-" + /*x*/ ctx[0] + "-" + /*y*/ ctx[1] + " svelte-1veput");
    			attr_dev(g, "transform", g_transform_value = `translate(${/*x*/ ctx[0]}, ${/*y*/ ctx[1]})`);
    			attr_dev(g, "tabindex", "0");
    			toggle_class(g, "is-focused", /*isFocused*/ ctx[7]);
    			toggle_class(g, "is-secondarily-focused", /*isSecondarilyFocused*/ ctx[8]);
    			toggle_class(g, "is-correct", /*showCheck*/ ctx[11] && /*correct*/ ctx[10]);
    			toggle_class(g, "is-incorrect", /*showCheck*/ ctx[11] && !/*correct*/ ctx[10]);
    			add_location(g, file$2, 94, 0, 2037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    			/*g_binding*/ ctx[23](g);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(g, "click", /*onClick*/ ctx[13], false, false, false),
    					listen_dev(g, "keydown", /*onKeydown*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showCheck*/ ctx[11] && !/*correct*/ ctx[10]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*value*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*value*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(g, text_1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*number*/ 8) set_data_dev(t, /*number*/ ctx[3]);

    			if (!current || dirty & /*custom, x, y*/ 19 && g_class_value !== (g_class_value = "cell " + /*custom*/ ctx[4] + " cell-" + /*x*/ ctx[0] + "-" + /*y*/ ctx[1] + " svelte-1veput")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (!current || dirty & /*x, y*/ 3 && g_transform_value !== (g_transform_value = `translate(${/*x*/ ctx[0]}, ${/*y*/ ctx[1]})`)) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (dirty & /*custom, x, y, isFocused*/ 147) {
    				toggle_class(g, "is-focused", /*isFocused*/ ctx[7]);
    			}

    			if (dirty & /*custom, x, y, isSecondarilyFocused*/ 275) {
    				toggle_class(g, "is-secondarily-focused", /*isSecondarilyFocused*/ ctx[8]);
    			}

    			if (dirty & /*custom, x, y, showCheck, correct*/ 3091) {
    				toggle_class(g, "is-correct", /*showCheck*/ ctx[11] && /*correct*/ ctx[10]);
    			}

    			if (dirty & /*custom, x, y, showCheck, correct*/ 3091) {
    				toggle_class(g, "is-incorrect", /*showCheck*/ ctx[11] && !/*correct*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*g_binding*/ ctx[23](null);
    			mounted = false;
    			run_all(dispose);
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

    function pop(node, { delay = 0, duration = 250 }) {
    	return {
    		delay,
    		duration,
    		css: t => [`transform: translate(0, ${1 - t}px)`].join(";"), //
    		
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cell", slots, []);
    	let { x } = $$props;
    	let { y } = $$props;
    	let { value } = $$props;
    	let { answer } = $$props;
    	let { number } = $$props;
    	let { index } = $$props;
    	let { custom } = $$props;
    	let { changeDelay = 0 } = $$props;
    	let { isRevealing = false } = $$props;
    	let { isChecking = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { isSecondarilyFocused = false } = $$props;

    	let { onFocusCell = () => {
    		
    	} } = $$props;

    	let { onCellUpdate = () => {
    		
    	} } = $$props;

    	let { onFocusClueDiff = () => {
    		
    	} } = $$props;

    	let { onMoveFocus = () => {
    		
    	} } = $$props;

    	let { onFlipDirection = () => {
    		
    	} } = $$props;

    	let { onHistoricalChange = () => {
    		
    	} } = $$props;

    	let element;

    	function onFocusSelf() {
    		if (!element) return;
    		if (isFocused) element.focus();
    	}

    	function onKeydown(e) {
    		if (e.ctrlKey && e.key.toLowerCase() == "z") {
    			onHistoricalChange(e.shiftKey ? 1 : -1);
    		}

    		if (e.ctrlKey) return;
    		if (e.altKey) return;

    		if (e.key === "Tab") {
    			onFocusClueDiff(e.shiftKey ? -1 : 1);
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}

    		if (e.key == " ") {
    			onFlipDirection();
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}

    		if (["Delete", "Backspace"].includes(e.key)) {
    			onCellUpdate(index, "", -1, true);
    			return;
    		}

    		const isKeyInAlphabet = (/^[a-zA-Z()]$/).test(e.key);

    		if (isKeyInAlphabet) {
    			onCellUpdate(index, e.key.toUpperCase());
    			return;
    		}

    		const diff = ({
    			ArrowLeft: ["across", -1],
    			ArrowRight: ["across", 1],
    			ArrowUp: ["down", -1],
    			ArrowDown: ["down", 1]
    		})[e.key];

    		if (diff) {
    			onMoveFocus(...diff);
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}
    	}

    	function onClick() {
    		onFocusCell(index);
    	}

    	const writable_props = [
    		"x",
    		"y",
    		"value",
    		"answer",
    		"number",
    		"index",
    		"custom",
    		"changeDelay",
    		"isRevealing",
    		"isChecking",
    		"isFocused",
    		"isSecondarilyFocused",
    		"onFocusCell",
    		"onCellUpdate",
    		"onFocusClueDiff",
    		"onMoveFocus",
    		"onFlipDirection",
    		"onHistoricalChange"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cell> was created with unknown prop '${key}'`);
    	});

    	function g_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("answer" in $$props) $$invalidate(14, answer = $$props.answer);
    		if ("number" in $$props) $$invalidate(3, number = $$props.number);
    		if ("index" in $$props) $$invalidate(15, index = $$props.index);
    		if ("custom" in $$props) $$invalidate(4, custom = $$props.custom);
    		if ("changeDelay" in $$props) $$invalidate(5, changeDelay = $$props.changeDelay);
    		if ("isRevealing" in $$props) $$invalidate(6, isRevealing = $$props.isRevealing);
    		if ("isChecking" in $$props) $$invalidate(16, isChecking = $$props.isChecking);
    		if ("isFocused" in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    		if ("isSecondarilyFocused" in $$props) $$invalidate(8, isSecondarilyFocused = $$props.isSecondarilyFocused);
    		if ("onFocusCell" in $$props) $$invalidate(17, onFocusCell = $$props.onFocusCell);
    		if ("onCellUpdate" in $$props) $$invalidate(18, onCellUpdate = $$props.onCellUpdate);
    		if ("onFocusClueDiff" in $$props) $$invalidate(19, onFocusClueDiff = $$props.onFocusClueDiff);
    		if ("onMoveFocus" in $$props) $$invalidate(20, onMoveFocus = $$props.onMoveFocus);
    		if ("onFlipDirection" in $$props) $$invalidate(21, onFlipDirection = $$props.onFlipDirection);
    		if ("onHistoricalChange" in $$props) $$invalidate(22, onHistoricalChange = $$props.onHistoricalChange);
    	};

    	$$self.$capture_state = () => ({
    		x,
    		y,
    		value,
    		answer,
    		number,
    		index,
    		custom,
    		changeDelay,
    		isRevealing,
    		isChecking,
    		isFocused,
    		isSecondarilyFocused,
    		onFocusCell,
    		onCellUpdate,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onHistoricalChange,
    		element,
    		onFocusSelf,
    		onKeydown,
    		onClick,
    		pop,
    		correct,
    		showCheck
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("answer" in $$props) $$invalidate(14, answer = $$props.answer);
    		if ("number" in $$props) $$invalidate(3, number = $$props.number);
    		if ("index" in $$props) $$invalidate(15, index = $$props.index);
    		if ("custom" in $$props) $$invalidate(4, custom = $$props.custom);
    		if ("changeDelay" in $$props) $$invalidate(5, changeDelay = $$props.changeDelay);
    		if ("isRevealing" in $$props) $$invalidate(6, isRevealing = $$props.isRevealing);
    		if ("isChecking" in $$props) $$invalidate(16, isChecking = $$props.isChecking);
    		if ("isFocused" in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    		if ("isSecondarilyFocused" in $$props) $$invalidate(8, isSecondarilyFocused = $$props.isSecondarilyFocused);
    		if ("onFocusCell" in $$props) $$invalidate(17, onFocusCell = $$props.onFocusCell);
    		if ("onCellUpdate" in $$props) $$invalidate(18, onCellUpdate = $$props.onCellUpdate);
    		if ("onFocusClueDiff" in $$props) $$invalidate(19, onFocusClueDiff = $$props.onFocusClueDiff);
    		if ("onMoveFocus" in $$props) $$invalidate(20, onMoveFocus = $$props.onMoveFocus);
    		if ("onFlipDirection" in $$props) $$invalidate(21, onFlipDirection = $$props.onFlipDirection);
    		if ("onHistoricalChange" in $$props) $$invalidate(22, onHistoricalChange = $$props.onHistoricalChange);
    		if ("element" in $$props) $$invalidate(9, element = $$props.element);
    		if ("correct" in $$props) $$invalidate(10, correct = $$props.correct);
    		if ("showCheck" in $$props) $$invalidate(11, showCheck = $$props.showCheck);
    	};

    	let correct;
    	let showCheck;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isFocused*/ 128) {
    			 (onFocusSelf());
    		}

    		if ($$self.$$.dirty & /*answer, value*/ 16388) {
    			 $$invalidate(10, correct = answer === value);
    		}

    		if ($$self.$$.dirty & /*isChecking, value*/ 65540) {
    			 $$invalidate(11, showCheck = isChecking && value);
    		}
    	};

    	return [
    		x,
    		y,
    		value,
    		number,
    		custom,
    		changeDelay,
    		isRevealing,
    		isFocused,
    		isSecondarilyFocused,
    		element,
    		correct,
    		showCheck,
    		onKeydown,
    		onClick,
    		answer,
    		index,
    		isChecking,
    		onFocusCell,
    		onCellUpdate,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onHistoricalChange,
    		g_binding
    	];
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			x: 0,
    			y: 1,
    			value: 2,
    			answer: 14,
    			number: 3,
    			index: 15,
    			custom: 4,
    			changeDelay: 5,
    			isRevealing: 6,
    			isChecking: 16,
    			isFocused: 7,
    			isSecondarilyFocused: 8,
    			onFocusCell: 17,
    			onCellUpdate: 18,
    			onFocusClueDiff: 19,
    			onMoveFocus: 20,
    			onFlipDirection: 21,
    			onHistoricalChange: 22
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cell",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[0] === undefined && !("x" in props)) {
    			console.warn("<Cell> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[1] === undefined && !("y" in props)) {
    			console.warn("<Cell> was created without expected prop 'y'");
    		}

    		if (/*value*/ ctx[2] === undefined && !("value" in props)) {
    			console.warn("<Cell> was created without expected prop 'value'");
    		}

    		if (/*answer*/ ctx[14] === undefined && !("answer" in props)) {
    			console.warn("<Cell> was created without expected prop 'answer'");
    		}

    		if (/*number*/ ctx[3] === undefined && !("number" in props)) {
    			console.warn("<Cell> was created without expected prop 'number'");
    		}

    		if (/*index*/ ctx[15] === undefined && !("index" in props)) {
    			console.warn("<Cell> was created without expected prop 'index'");
    		}

    		if (/*custom*/ ctx[4] === undefined && !("custom" in props)) {
    			console.warn("<Cell> was created without expected prop 'custom'");
    		}
    	}

    	get x() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get answer() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answer(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get number() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get changeDelay() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changeDelay(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRevealing() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRevealing(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isChecking() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isChecking(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSecondarilyFocused() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSecondarilyFocused(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocusCell() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocusCell(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCellUpdate() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCellUpdate(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocusClueDiff() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocusClueDiff(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onMoveFocus() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onMoveFocus(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFlipDirection() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFlipDirection(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onHistoricalChange() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onHistoricalChange(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Puzzle.svelte generated by Svelte v3.29.0 */
    const file$3 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Puzzle.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i].x;
    	child_ctx[37] = list[i].y;
    	child_ctx[38] = list[i].value;
    	child_ctx[39] = list[i].answer;
    	child_ctx[40] = list[i].index;
    	child_ctx[41] = list[i].number;
    	child_ctx[42] = list[i].custom;
    	return child_ctx;
    }

    // (200:4) {#each cells as { x, y, value, answer, index, number, custom }}
    function create_each_block$2(ctx) {
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				x: /*x*/ ctx[36],
    				y: /*y*/ ctx[37],
    				index: /*index*/ ctx[40],
    				value: /*value*/ ctx[38],
    				answer: /*answer*/ ctx[39],
    				number: /*number*/ ctx[41],
    				custom: /*custom*/ ctx[42],
    				changeDelay: /*isRevealing*/ ctx[2]
    				? /*revealDuration*/ ctx[6] / /*cells*/ ctx[0].length * /*index*/ ctx[40]
    				: 0,
    				isRevealing: /*isRevealing*/ ctx[2],
    				isChecking: /*isChecking*/ ctx[3],
    				isFocused: /*focusedCellIndex*/ ctx[1] == /*index*/ ctx[40] && !/*isDisableHighlight*/ ctx[4],
    				isSecondarilyFocused: /*secondarilyFocusedCells*/ ctx[10].includes(/*index*/ ctx[40]) && !/*isDisableHighlight*/ ctx[4],
    				onFocusCell: /*onFocusCell*/ ctx[16],
    				onCellUpdate: /*onCellUpdate*/ ctx[14],
    				onFocusClueDiff: /*onFocusClueDiff*/ ctx[17],
    				onMoveFocus: /*onMoveFocus*/ ctx[18],
    				onFlipDirection: /*onFlipDirection*/ ctx[19],
    				onHistoricalChange: /*onHistoricalChange*/ ctx[15]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(cell.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell_changes = {};
    			if (dirty[0] & /*cells*/ 1) cell_changes.x = /*x*/ ctx[36];
    			if (dirty[0] & /*cells*/ 1) cell_changes.y = /*y*/ ctx[37];
    			if (dirty[0] & /*cells*/ 1) cell_changes.index = /*index*/ ctx[40];
    			if (dirty[0] & /*cells*/ 1) cell_changes.value = /*value*/ ctx[38];
    			if (dirty[0] & /*cells*/ 1) cell_changes.answer = /*answer*/ ctx[39];
    			if (dirty[0] & /*cells*/ 1) cell_changes.number = /*number*/ ctx[41];
    			if (dirty[0] & /*cells*/ 1) cell_changes.custom = /*custom*/ ctx[42];

    			if (dirty[0] & /*isRevealing, revealDuration, cells*/ 69) cell_changes.changeDelay = /*isRevealing*/ ctx[2]
    			? /*revealDuration*/ ctx[6] / /*cells*/ ctx[0].length * /*index*/ ctx[40]
    			: 0;

    			if (dirty[0] & /*isRevealing*/ 4) cell_changes.isRevealing = /*isRevealing*/ ctx[2];
    			if (dirty[0] & /*isChecking*/ 8) cell_changes.isChecking = /*isChecking*/ ctx[3];
    			if (dirty[0] & /*focusedCellIndex, cells, isDisableHighlight*/ 19) cell_changes.isFocused = /*focusedCellIndex*/ ctx[1] == /*index*/ ctx[40] && !/*isDisableHighlight*/ ctx[4];
    			if (dirty[0] & /*secondarilyFocusedCells, cells, isDisableHighlight*/ 1041) cell_changes.isSecondarilyFocused = /*secondarilyFocusedCells*/ ctx[10].includes(/*index*/ ctx[40]) && !/*isDisableHighlight*/ ctx[4];
    			cell.$set(cell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(200:4) {#each cells as { x, y, value, answer, index, number, custom }}",
    		ctx
    	});

    	return block;
    }

    // (224:0) {#if keyboardVisible}
    function create_if_block$3(ctx) {
    	let div;
    	let keyboard;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				layout: "crossword",
    				style: /*keyboardStyle*/ ctx[8]
    			},
    			$$inline: true
    		});

    	keyboard.$on("keydown", /*onKeydown*/ ctx[20]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(keyboard.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(keyboard.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "keyboard svelte-ce6hth");
    			add_location(div, file$3, 224, 2, 6863);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(keyboard, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const keyboard_changes = {};
    			if (dirty[0] & /*keyboardStyle*/ 256) keyboard_changes.style = /*keyboardStyle*/ ctx[8];
    			keyboard.$set(keyboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keyboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(keyboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(224:0) {#if keyboardVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let svg;
    	let svg_viewBox_value;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*cells*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*keyboardVisible*/ ctx[13] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			section = claim_element(nodes, "SECTION", { class: true });
    			var section_nodes = children(section);
    			svg = claim_element(section_nodes, "svg", { viewBox: true, class: true }, 1);
    			var svg_nodes = children(svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(svg_nodes);
    			}

    			svg_nodes.forEach(detach_dev);
    			section_nodes.forEach(detach_dev);
    			t = claim_space(nodes);
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*w*/ ctx[11] + " " + /*h*/ ctx[12]);
    			attr_dev(svg, "class", "svelte-ce6hth");
    			add_location(svg, file$3, 198, 2, 5970);
    			attr_dev(section, "class", "puzzle svelte-ce6hth");
    			toggle_class(section, "stacked", /*stacked*/ ctx[5]);
    			toggle_class(section, "is-loaded", /*isLoaded*/ ctx[7]);
    			add_location(section, file$3, 193, 0, 5870);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			/*section_binding*/ ctx[26](section);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "click", /*onClick*/ ctx[21], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cells, isRevealing, revealDuration, isChecking, focusedCellIndex, isDisableHighlight, secondarilyFocusedCells, onFocusCell, onCellUpdate, onFocusClueDiff, onMoveFocus, onFlipDirection, onHistoricalChange*/ 1033311) {
    				each_value = /*cells*/ ctx[0];
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
    						each_blocks[i].m(svg, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*w, h*/ 6144 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*w*/ ctx[11] + " " + /*h*/ ctx[12])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty[0] & /*stacked*/ 32) {
    				toggle_class(section, "stacked", /*stacked*/ ctx[5]);
    			}

    			if (dirty[0] & /*isLoaded*/ 128) {
    				toggle_class(section, "is-loaded", /*isLoaded*/ ctx[7]);
    			}

    			if (/*keyboardVisible*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*keyboardVisible*/ 8192) {
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

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			/*section_binding*/ ctx[26](null);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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

    const numberOfStatesInHistory = 10;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Puzzle", slots, []);
    	let { clues } = $$props;
    	let { cells } = $$props;
    	let { focusedDirection } = $$props;
    	let { focusedCellIndex } = $$props;
    	let { focusedCell } = $$props;
    	let { isRevealing } = $$props;
    	let { isChecking } = $$props;
    	let { isDisableHighlight } = $$props;
    	let { stacked } = $$props;
    	let { revealDuration = 0 } = $$props;
    	let { showKeyboard } = $$props;
    	let { isLoaded } = $$props;
    	let { keyboardStyle } = $$props;
    	let element;
    	let cellsHistoryIndex = 0;
    	let cellsHistory = [];
    	let focusedCellIndexHistoryIndex = 0;
    	let focusedCellIndexHistory = [];
    	let secondarilyFocusedCells = [];
    	let isMobile = false;
    	let isPuzzleFocused = false;

    	onMount(() => {
    		$$invalidate(31, isMobile = checkMobile());
    	});

    	function updateSecondarilyFocusedCells() {
    		$$invalidate(10, secondarilyFocusedCells = getSecondarilyFocusedCells({ cells, focusedDirection, focusedCell }));
    	}

    	function onCellUpdate(index, newValue, diff = 1, doReplaceFilledCells) {
    		doReplaceFilledCells = doReplaceFilledCells || !!cells[index].value;
    		const dimension = focusedDirection == "across" ? "x" : "y";
    		const clueIndex = cells[index].clueNumbers[focusedDirection];
    		const cellsInClue = cells.filter(cell => cell.clueNumbers[focusedDirection] == clueIndex && (doReplaceFilledCells || !cell.value));
    		const cellsInCluePositions = cellsInClue.map(cell => cell[dimension]).filter(Number.isFinite);
    		const isAtEndOfClue = cells[index][dimension] == Math.max(...cellsInCluePositions);

    		const newCells = [
    			...cells.slice(0, index),
    			{ ...cells[index], value: newValue },
    			...cells.slice(index + 1)
    		];

    		cellsHistory = [newCells, ...cellsHistory.slice(cellsHistoryIndex)].slice(0, numberOfStatesInHistory);
    		cellsHistoryIndex = 0;
    		$$invalidate(0, cells = newCells);

    		if (isAtEndOfClue && diff > 0) {
    			onFocusClueDiff(diff);
    		} else {
    			onFocusCellDiff(diff, doReplaceFilledCells);
    		}
    	}

    	function onHistoricalChange(diff) {
    		cellsHistoryIndex += -diff;
    		$$invalidate(0, cells = cellsHistory[cellsHistoryIndex] || cells);
    		focusedCellIndexHistoryIndex += -diff;
    		$$invalidate(1, focusedCellIndex = focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex);
    	}

    	function onFocusCell(index) {
    		if (isPuzzleFocused && index == focusedCellIndex) {
    			onFlipDirection();
    		} else {
    			$$invalidate(1, focusedCellIndex = index);

    			if (!cells[focusedCellIndex].clueNumbers[focusedDirection]) {
    				const newDirection = focusedDirection === "across" ? "down" : "across";
    				$$invalidate(22, focusedDirection = newDirection);
    			}

    			focusedCellIndexHistory = [index, ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory)];
    			focusedCellIndexHistoryIndex = 0;
    		}
    	}

    	function onFocusCellDiff(diff, doReplaceFilledCells = true) {
    		const sortedCellsInDirectionFiltered = sortedCellsInDirection.filter(d => doReplaceFilledCells ? true : !d.value);
    		const currentCellIndex = sortedCellsInDirectionFiltered.findIndex(d => d.index == focusedCellIndex);
    		const nextCellIndex = (sortedCellsInDirectionFiltered[currentCellIndex + diff] || {}).index;
    		const nextCell = cells[nextCellIndex];
    		if (!nextCell) return;
    		onFocusCell(nextCellIndex);
    	}

    	function onFocusClueDiff(diff = 1) {
    		const currentNumber = focusedCell.clueNumbers[focusedDirection];

    		let nextCluesInDirection = clues.filter(clue => !clue.isFilled && (diff > 0
    		? clue.number > currentNumber
    		: clue.number < currentNumber) && clue.direction == focusedDirection);

    		if (diff < 0) {
    			nextCluesInDirection = nextCluesInDirection.reverse();
    		}

    		let nextClue = nextCluesInDirection[Math.abs(diff) - 1];

    		if (!nextClue) {
    			onFlipDirection();
    			nextClue = clues.filter(clue => clue.direction == focusedDirection)[0];
    		}

    		const nextFocusedCell = sortedCellsInDirection.find(cell => !cell.value && cell.clueNumbers[focusedDirection] == nextClue.number) || {};
    		$$invalidate(1, focusedCellIndex = nextFocusedCell.index || 0);
    	}

    	function onMoveFocus(direction, diff) {
    		if (focusedDirection != direction) {
    			$$invalidate(22, focusedDirection = direction);
    		} else {
    			const nextCell = getCellAfterDiff({ diff, cells, direction, focusedCell });
    			if (!nextCell) return;
    			onFocusCell(nextCell.index);
    		}
    	}

    	function onFlipDirection() {
    		const newDirection = focusedDirection === "across" ? "down" : "across";
    		const hasClueInNewDirection = !!focusedCell["clueNumbers"][newDirection];
    		if (hasClueInNewDirection) $$invalidate(22, focusedDirection = newDirection);
    	}

    	function onKeydown({ detail }) {
    		const diff = detail === "Backspace" ? -1 : 1;
    		const value = detail === "Backspace" ? "" : detail;
    		onCellUpdate(focusedCellIndex, value, diff);
    	}

    	function onClick() {
    		isPuzzleFocused = element.contains(document.activeElement);
    	}

    	const writable_props = [
    		"clues",
    		"cells",
    		"focusedDirection",
    		"focusedCellIndex",
    		"focusedCell",
    		"isRevealing",
    		"isChecking",
    		"isDisableHighlight",
    		"stacked",
    		"revealDuration",
    		"showKeyboard",
    		"isLoaded",
    		"keyboardStyle"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Puzzle> was created with unknown prop '${key}'`);
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("clues" in $$props) $$invalidate(23, clues = $$props.clues);
    		if ("cells" in $$props) $$invalidate(0, cells = $$props.cells);
    		if ("focusedDirection" in $$props) $$invalidate(22, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(1, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(24, focusedCell = $$props.focusedCell);
    		if ("isRevealing" in $$props) $$invalidate(2, isRevealing = $$props.isRevealing);
    		if ("isChecking" in $$props) $$invalidate(3, isChecking = $$props.isChecking);
    		if ("isDisableHighlight" in $$props) $$invalidate(4, isDisableHighlight = $$props.isDisableHighlight);
    		if ("stacked" in $$props) $$invalidate(5, stacked = $$props.stacked);
    		if ("revealDuration" in $$props) $$invalidate(6, revealDuration = $$props.revealDuration);
    		if ("showKeyboard" in $$props) $$invalidate(25, showKeyboard = $$props.showKeyboard);
    		if ("isLoaded" in $$props) $$invalidate(7, isLoaded = $$props.isLoaded);
    		if ("keyboardStyle" in $$props) $$invalidate(8, keyboardStyle = $$props.keyboardStyle);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Keyboard,
    		getSecondarilyFocusedCells,
    		getCellAfterDiff,
    		checkMobile,
    		Cell,
    		clues,
    		cells,
    		focusedDirection,
    		focusedCellIndex,
    		focusedCell,
    		isRevealing,
    		isChecking,
    		isDisableHighlight,
    		stacked,
    		revealDuration,
    		showKeyboard,
    		isLoaded,
    		keyboardStyle,
    		element,
    		cellsHistoryIndex,
    		cellsHistory,
    		focusedCellIndexHistoryIndex,
    		focusedCellIndexHistory,
    		secondarilyFocusedCells,
    		isMobile,
    		isPuzzleFocused,
    		numberOfStatesInHistory,
    		updateSecondarilyFocusedCells,
    		onCellUpdate,
    		onHistoricalChange,
    		onFocusCell,
    		onFocusCellDiff,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onKeydown,
    		onClick,
    		w,
    		h,
    		keyboardVisible,
    		sortedCellsInDirection
    	});

    	$$self.$inject_state = $$props => {
    		if ("clues" in $$props) $$invalidate(23, clues = $$props.clues);
    		if ("cells" in $$props) $$invalidate(0, cells = $$props.cells);
    		if ("focusedDirection" in $$props) $$invalidate(22, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(1, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(24, focusedCell = $$props.focusedCell);
    		if ("isRevealing" in $$props) $$invalidate(2, isRevealing = $$props.isRevealing);
    		if ("isChecking" in $$props) $$invalidate(3, isChecking = $$props.isChecking);
    		if ("isDisableHighlight" in $$props) $$invalidate(4, isDisableHighlight = $$props.isDisableHighlight);
    		if ("stacked" in $$props) $$invalidate(5, stacked = $$props.stacked);
    		if ("revealDuration" in $$props) $$invalidate(6, revealDuration = $$props.revealDuration);
    		if ("showKeyboard" in $$props) $$invalidate(25, showKeyboard = $$props.showKeyboard);
    		if ("isLoaded" in $$props) $$invalidate(7, isLoaded = $$props.isLoaded);
    		if ("keyboardStyle" in $$props) $$invalidate(8, keyboardStyle = $$props.keyboardStyle);
    		if ("element" in $$props) $$invalidate(9, element = $$props.element);
    		if ("cellsHistoryIndex" in $$props) cellsHistoryIndex = $$props.cellsHistoryIndex;
    		if ("cellsHistory" in $$props) cellsHistory = $$props.cellsHistory;
    		if ("focusedCellIndexHistoryIndex" in $$props) focusedCellIndexHistoryIndex = $$props.focusedCellIndexHistoryIndex;
    		if ("focusedCellIndexHistory" in $$props) focusedCellIndexHistory = $$props.focusedCellIndexHistory;
    		if ("secondarilyFocusedCells" in $$props) $$invalidate(10, secondarilyFocusedCells = $$props.secondarilyFocusedCells);
    		if ("isMobile" in $$props) $$invalidate(31, isMobile = $$props.isMobile);
    		if ("isPuzzleFocused" in $$props) isPuzzleFocused = $$props.isPuzzleFocused;
    		if ("w" in $$props) $$invalidate(11, w = $$props.w);
    		if ("h" in $$props) $$invalidate(12, h = $$props.h);
    		if ("keyboardVisible" in $$props) $$invalidate(13, keyboardVisible = $$props.keyboardVisible);
    		if ("sortedCellsInDirection" in $$props) sortedCellsInDirection = $$props.sortedCellsInDirection;
    	};

    	let w;
    	let h;
    	let keyboardVisible;
    	let sortedCellsInDirection;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*cells*/ 1) {
    			 $$invalidate(11, w = Math.max(...cells.map(d => d.x)) + 1);
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 1) {
    			 $$invalidate(12, h = Math.max(...cells.map(d => d.y)) + 1);
    		}

    		if ($$self.$$.dirty[0] & /*showKeyboard*/ 33554432 | $$self.$$.dirty[1] & /*isMobile*/ 1) {
    			 $$invalidate(13, keyboardVisible = typeof showKeyboard === "boolean"
    			? showKeyboard
    			: isMobile);
    		}

    		if ($$self.$$.dirty[0] & /*cells, focusedCellIndex, focusedDirection*/ 4194307) {
    			 (updateSecondarilyFocusedCells());
    		}

    		if ($$self.$$.dirty[0] & /*cells, focusedDirection*/ 4194305) {
    			 sortedCellsInDirection = [...cells].sort((a, b) => focusedDirection == "down"
    			? a.x - b.x || a.y - b.y
    			: a.y - b.y || a.x - b.x);
    		}
    	};

    	return [
    		cells,
    		focusedCellIndex,
    		isRevealing,
    		isChecking,
    		isDisableHighlight,
    		stacked,
    		revealDuration,
    		isLoaded,
    		keyboardStyle,
    		element,
    		secondarilyFocusedCells,
    		w,
    		h,
    		keyboardVisible,
    		onCellUpdate,
    		onHistoricalChange,
    		onFocusCell,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onKeydown,
    		onClick,
    		focusedDirection,
    		clues,
    		focusedCell,
    		showKeyboard,
    		section_binding
    	];
    }

    class Puzzle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				clues: 23,
    				cells: 0,
    				focusedDirection: 22,
    				focusedCellIndex: 1,
    				focusedCell: 24,
    				isRevealing: 2,
    				isChecking: 3,
    				isDisableHighlight: 4,
    				stacked: 5,
    				revealDuration: 6,
    				showKeyboard: 25,
    				isLoaded: 7,
    				keyboardStyle: 8
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Puzzle",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*clues*/ ctx[23] === undefined && !("clues" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'clues'");
    		}

    		if (/*cells*/ ctx[0] === undefined && !("cells" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'cells'");
    		}

    		if (/*focusedDirection*/ ctx[22] === undefined && !("focusedDirection" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'focusedDirection'");
    		}

    		if (/*focusedCellIndex*/ ctx[1] === undefined && !("focusedCellIndex" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'focusedCellIndex'");
    		}

    		if (/*focusedCell*/ ctx[24] === undefined && !("focusedCell" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'focusedCell'");
    		}

    		if (/*isRevealing*/ ctx[2] === undefined && !("isRevealing" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'isRevealing'");
    		}

    		if (/*isChecking*/ ctx[3] === undefined && !("isChecking" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'isChecking'");
    		}

    		if (/*isDisableHighlight*/ ctx[4] === undefined && !("isDisableHighlight" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'isDisableHighlight'");
    		}

    		if (/*stacked*/ ctx[5] === undefined && !("stacked" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'stacked'");
    		}

    		if (/*showKeyboard*/ ctx[25] === undefined && !("showKeyboard" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'showKeyboard'");
    		}

    		if (/*isLoaded*/ ctx[7] === undefined && !("isLoaded" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'isLoaded'");
    		}

    		if (/*keyboardStyle*/ ctx[8] === undefined && !("keyboardStyle" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'keyboardStyle'");
    		}
    	}

    	get clues() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clues(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cells() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cells(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedDirection() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedDirection(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCellIndex() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCellIndex(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCell() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCell(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRevealing() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRevealing(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isChecking() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isChecking(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisableHighlight() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisableHighlight(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stacked() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stacked(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get revealDuration() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set revealDuration(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showKeyboard() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showKeyboard(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLoaded() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLoaded(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keyboardStyle() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keyboardStyle(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function scrollTO (node, isFocused) {
      return {
        update(newIsFocused) {
          isFocused = newIsFocused;
          if (!isFocused) return;
          const list = node.parentElement.parentElement;
          if (!list) return;

          const top = node.offsetTop;
          const currentYTop = list.scrollTop;
          const currentYBottom = currentYTop + list.clientHeight;
          const buffer = 50;
          if (top < currentYTop + buffer || top > currentYBottom - buffer) {
            list.scrollTo({ top: top, behavior: "smooth" });
          }
        },
      };
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Clue.svelte generated by Svelte v3.29.0 */
    const file$4 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Clue.svelte";

    function create_fragment$4(ctx) {
    	let li;
    	let button;
    	let strong;
    	let t0;
    	let t1;
    	let t2;
    	let button_class_value;
    	let scrollTo_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			strong = element("strong");
    			t0 = text(/*number*/ ctx[0]);
    			t1 = space();
    			t2 = text(/*clue*/ ctx[1]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", {});
    			var li_nodes = children(li);
    			button = claim_element(li_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			strong = claim_element(button_nodes, "STRONG", { class: true });
    			var strong_nodes = children(strong);
    			t0 = claim_text(strong_nodes, /*number*/ ctx[0]);
    			strong_nodes.forEach(detach_dev);
    			t1 = claim_space(button_nodes);
    			t2 = claim_text(button_nodes, /*clue*/ ctx[1]);
    			button_nodes.forEach(detach_dev);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(strong, "class", "svelte-hozmon");
    			add_location(strong, file$4, 25, 4, 666);
    			attr_dev(button, "class", button_class_value = "clue " + /*custom*/ ctx[2] + " svelte-hozmon");
    			toggle_class(button, "is-disable-highlight", /*isDisableHighlight*/ ctx[6]);
    			toggle_class(button, "is-number-focused", /*isNumberFocused*/ ctx[4]);
    			toggle_class(button, "is-direction-focused", /*isDirectionFocused*/ ctx[5]);
    			toggle_class(button, "is-filled", /*isFilled*/ ctx[3]);
    			add_location(button, file$4, 18, 2, 413);
    			add_location(li, file$4, 17, 0, 357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, strong);
    			append_dev(strong, t0);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			/*li_binding*/ ctx[10](li);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*onFocus*/ ctx[7])) /*onFocus*/ ctx[7].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					action_destroyer(scrollTo_action = scrollTO.call(null, li, /*isFocused*/ ctx[9]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*number*/ 1) set_data_dev(t0, /*number*/ ctx[0]);
    			if (dirty & /*clue*/ 2) set_data_dev(t2, /*clue*/ ctx[1]);

    			if (dirty & /*custom*/ 4 && button_class_value !== (button_class_value = "clue " + /*custom*/ ctx[2] + " svelte-hozmon")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*custom, isDisableHighlight*/ 68) {
    				toggle_class(button, "is-disable-highlight", /*isDisableHighlight*/ ctx[6]);
    			}

    			if (dirty & /*custom, isNumberFocused*/ 20) {
    				toggle_class(button, "is-number-focused", /*isNumberFocused*/ ctx[4]);
    			}

    			if (dirty & /*custom, isDirectionFocused*/ 36) {
    				toggle_class(button, "is-direction-focused", /*isDirectionFocused*/ ctx[5]);
    			}

    			if (dirty & /*custom, isFilled*/ 12) {
    				toggle_class(button, "is-filled", /*isFilled*/ ctx[3]);
    			}

    			if (scrollTo_action && is_function(scrollTo_action.update) && dirty & /*isFocused*/ 512) scrollTo_action.update.call(null, /*isFocused*/ ctx[9]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			/*li_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clue", slots, []);
    	let { number } = $$props;
    	let { clue } = $$props;
    	let { custom } = $$props;
    	let { isFilled } = $$props;
    	let { isNumberFocused = false } = $$props;
    	let { isDirectionFocused = false } = $$props;
    	let { isDisableHighlight = false } = $$props;

    	let { onFocus = () => {
    		
    	} } = $$props;

    	let element;

    	const writable_props = [
    		"number",
    		"clue",
    		"custom",
    		"isFilled",
    		"isNumberFocused",
    		"isDirectionFocused",
    		"isDisableHighlight",
    		"onFocus"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clue> was created with unknown prop '${key}'`);
    	});

    	function li_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(8, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("clue" in $$props) $$invalidate(1, clue = $$props.clue);
    		if ("custom" in $$props) $$invalidate(2, custom = $$props.custom);
    		if ("isFilled" in $$props) $$invalidate(3, isFilled = $$props.isFilled);
    		if ("isNumberFocused" in $$props) $$invalidate(4, isNumberFocused = $$props.isNumberFocused);
    		if ("isDirectionFocused" in $$props) $$invalidate(5, isDirectionFocused = $$props.isDirectionFocused);
    		if ("isDisableHighlight" in $$props) $$invalidate(6, isDisableHighlight = $$props.isDisableHighlight);
    		if ("onFocus" in $$props) $$invalidate(7, onFocus = $$props.onFocus);
    	};

    	$$self.$capture_state = () => ({
    		scrollTo: scrollTO,
    		number,
    		clue,
    		custom,
    		isFilled,
    		isNumberFocused,
    		isDirectionFocused,
    		isDisableHighlight,
    		onFocus,
    		element,
    		isFocused
    	});

    	$$self.$inject_state = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("clue" in $$props) $$invalidate(1, clue = $$props.clue);
    		if ("custom" in $$props) $$invalidate(2, custom = $$props.custom);
    		if ("isFilled" in $$props) $$invalidate(3, isFilled = $$props.isFilled);
    		if ("isNumberFocused" in $$props) $$invalidate(4, isNumberFocused = $$props.isNumberFocused);
    		if ("isDirectionFocused" in $$props) $$invalidate(5, isDirectionFocused = $$props.isDirectionFocused);
    		if ("isDisableHighlight" in $$props) $$invalidate(6, isDisableHighlight = $$props.isDisableHighlight);
    		if ("onFocus" in $$props) $$invalidate(7, onFocus = $$props.onFocus);
    		if ("element" in $$props) $$invalidate(8, element = $$props.element);
    		if ("isFocused" in $$props) $$invalidate(9, isFocused = $$props.isFocused);
    	};

    	let isFocused;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isNumberFocused*/ 16) {
    			 $$invalidate(9, isFocused = isNumberFocused);
    		}
    	};

    	return [
    		number,
    		clue,
    		custom,
    		isFilled,
    		isNumberFocused,
    		isDirectionFocused,
    		isDisableHighlight,
    		onFocus,
    		element,
    		isFocused,
    		li_binding
    	];
    }

    class Clue extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			number: 0,
    			clue: 1,
    			custom: 2,
    			isFilled: 3,
    			isNumberFocused: 4,
    			isDirectionFocused: 5,
    			isDisableHighlight: 6,
    			onFocus: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clue",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*number*/ ctx[0] === undefined && !("number" in props)) {
    			console.warn("<Clue> was created without expected prop 'number'");
    		}

    		if (/*clue*/ ctx[1] === undefined && !("clue" in props)) {
    			console.warn("<Clue> was created without expected prop 'clue'");
    		}

    		if (/*custom*/ ctx[2] === undefined && !("custom" in props)) {
    			console.warn("<Clue> was created without expected prop 'custom'");
    		}

    		if (/*isFilled*/ ctx[3] === undefined && !("isFilled" in props)) {
    			console.warn("<Clue> was created without expected prop 'isFilled'");
    		}
    	}

    	get number() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clue() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clue(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFilled() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFilled(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isNumberFocused() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isNumberFocused(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDirectionFocused() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDirectionFocused(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisableHighlight() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisableHighlight(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocus() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocus(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/ClueList.svelte generated by Svelte v3.29.0 */
    const file$5 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/ClueList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (15:4) {#each clues as clue}
    function create_each_block$3(ctx) {
    	let clue;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[6](/*clue*/ ctx[7], ...args);
    	}

    	clue = new Clue({
    			props: {
    				clue: /*clue*/ ctx[7].clue,
    				number: /*clue*/ ctx[7].number,
    				custom: /*clue*/ ctx[7].custom,
    				isFilled: /*clue*/ ctx[7].isFilled,
    				isNumberFocused: /*focusedClueNumbers*/ ctx[2][/*direction*/ ctx[0]] === /*clue*/ ctx[7].number,
    				isDirectionFocused: /*isDirectionFocused*/ ctx[3],
    				isDisableHighlight: /*isDisableHighlight*/ ctx[5],
    				onFocus: func
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(clue.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(clue.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(clue, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const clue_changes = {};
    			if (dirty & /*clues*/ 2) clue_changes.clue = /*clue*/ ctx[7].clue;
    			if (dirty & /*clues*/ 2) clue_changes.number = /*clue*/ ctx[7].number;
    			if (dirty & /*clues*/ 2) clue_changes.custom = /*clue*/ ctx[7].custom;
    			if (dirty & /*clues*/ 2) clue_changes.isFilled = /*clue*/ ctx[7].isFilled;
    			if (dirty & /*focusedClueNumbers, direction, clues*/ 7) clue_changes.isNumberFocused = /*focusedClueNumbers*/ ctx[2][/*direction*/ ctx[0]] === /*clue*/ ctx[7].number;
    			if (dirty & /*isDirectionFocused*/ 8) clue_changes.isDirectionFocused = /*isDirectionFocused*/ ctx[3];
    			if (dirty & /*isDisableHighlight*/ 32) clue_changes.isDisableHighlight = /*isDisableHighlight*/ ctx[5];
    			if (dirty & /*onClueFocus, clues*/ 18) clue_changes.onFocus = func;
    			clue.$set(clue_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clue.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clue.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(clue, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(15:4) {#each clues as clue}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let div;
    	let ul;
    	let current;
    	let each_value = /*clues*/ ctx[1];
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
    			p = element("p");
    			t0 = text(/*direction*/ ctx[0]);
    			t1 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, /*direction*/ ctx[0]);
    			p_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			ul = claim_element(div_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p, "class", "svelte-16s2wyn");
    			add_location(p, file$5, 11, 0, 226);
    			attr_dev(ul, "class", "svelte-16s2wyn");
    			add_location(ul, file$5, 13, 2, 266);
    			attr_dev(div, "class", "list svelte-16s2wyn");
    			add_location(div, file$5, 12, 0, 245);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*direction*/ 1) set_data_dev(t0, /*direction*/ ctx[0]);

    			if (dirty & /*clues, focusedClueNumbers, direction, isDirectionFocused, isDisableHighlight, onClueFocus*/ 63) {
    				each_value = /*clues*/ ctx[1];
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
    						each_blocks[i].m(ul, null);
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
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClueList", slots, []);
    	let { direction } = $$props;
    	let { clues } = $$props;
    	let { focusedClueNumbers } = $$props;
    	let { isDirectionFocused } = $$props;
    	let { onClueFocus } = $$props;
    	let { isDisableHighlight } = $$props;

    	const writable_props = [
    		"direction",
    		"clues",
    		"focusedClueNumbers",
    		"isDirectionFocused",
    		"onClueFocus",
    		"isDisableHighlight"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClueList> was created with unknown prop '${key}'`);
    	});

    	const func = clue => onClueFocus(clue);

    	$$self.$$set = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("focusedClueNumbers" in $$props) $$invalidate(2, focusedClueNumbers = $$props.focusedClueNumbers);
    		if ("isDirectionFocused" in $$props) $$invalidate(3, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onClueFocus" in $$props) $$invalidate(4, onClueFocus = $$props.onClueFocus);
    		if ("isDisableHighlight" in $$props) $$invalidate(5, isDisableHighlight = $$props.isDisableHighlight);
    	};

    	$$self.$capture_state = () => ({
    		Clue,
    		direction,
    		clues,
    		focusedClueNumbers,
    		isDirectionFocused,
    		onClueFocus,
    		isDisableHighlight
    	});

    	$$self.$inject_state = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("focusedClueNumbers" in $$props) $$invalidate(2, focusedClueNumbers = $$props.focusedClueNumbers);
    		if ("isDirectionFocused" in $$props) $$invalidate(3, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onClueFocus" in $$props) $$invalidate(4, onClueFocus = $$props.onClueFocus);
    		if ("isDisableHighlight" in $$props) $$invalidate(5, isDisableHighlight = $$props.isDisableHighlight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		direction,
    		clues,
    		focusedClueNumbers,
    		isDirectionFocused,
    		onClueFocus,
    		isDisableHighlight,
    		func
    	];
    }

    class ClueList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			direction: 0,
    			clues: 1,
    			focusedClueNumbers: 2,
    			isDirectionFocused: 3,
    			onClueFocus: 4,
    			isDisableHighlight: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClueList",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*direction*/ ctx[0] === undefined && !("direction" in props)) {
    			console.warn("<ClueList> was created without expected prop 'direction'");
    		}

    		if (/*clues*/ ctx[1] === undefined && !("clues" in props)) {
    			console.warn("<ClueList> was created without expected prop 'clues'");
    		}

    		if (/*focusedClueNumbers*/ ctx[2] === undefined && !("focusedClueNumbers" in props)) {
    			console.warn("<ClueList> was created without expected prop 'focusedClueNumbers'");
    		}

    		if (/*isDirectionFocused*/ ctx[3] === undefined && !("isDirectionFocused" in props)) {
    			console.warn("<ClueList> was created without expected prop 'isDirectionFocused'");
    		}

    		if (/*onClueFocus*/ ctx[4] === undefined && !("onClueFocus" in props)) {
    			console.warn("<ClueList> was created without expected prop 'onClueFocus'");
    		}

    		if (/*isDisableHighlight*/ ctx[5] === undefined && !("isDisableHighlight" in props)) {
    			console.warn("<ClueList> was created without expected prop 'isDisableHighlight'");
    		}
    	}

    	get direction() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clues() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clues(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedClueNumbers() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedClueNumbers(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDirectionFocused() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDirectionFocused(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClueFocus() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClueFocus(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisableHighlight() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisableHighlight(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/ClueBar.svelte generated by Svelte v3.29.0 */
    const file$6 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/ClueBar.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let polyline0;
    	let t0;
    	let p;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let polyline1;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			polyline0 = svg_element("polyline");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*clue*/ ctx[1]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			polyline1 = svg_element("polyline");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			button0 = claim_element(div_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);

    			svg0 = claim_element(
    				button0_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					stroke: true,
    					"stroke-width": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true,
    					class: true
    				},
    				1
    			);

    			var svg0_nodes = children(svg0);
    			polyline0 = claim_element(svg0_nodes, "polyline", { points: true }, 1);
    			children(polyline0).forEach(detach_dev);
    			svg0_nodes.forEach(detach_dev);
    			button0_nodes.forEach(detach_dev);
    			t0 = claim_space(div_nodes);
    			p = claim_element(div_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t1 = claim_text(p_nodes, /*clue*/ ctx[1]);
    			p_nodes.forEach(detach_dev);
    			t2 = claim_space(div_nodes);
    			button1 = claim_element(div_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);

    			svg1 = claim_element(
    				button1_nodes,
    				"svg",
    				{
    					width: true,
    					height: true,
    					viewBox: true,
    					fill: true,
    					stroke: true,
    					"stroke-width": true,
    					"stroke-linecap": true,
    					"stroke-linejoin": true,
    					class: true
    				},
    				1
    			);

    			var svg1_nodes = children(svg1);
    			polyline1 = claim_element(svg1_nodes, "polyline", { points: true }, 1);
    			children(polyline1).forEach(detach_dev);
    			svg1_nodes.forEach(detach_dev);
    			button1_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(polyline0, "points", "15 18 9 12 15 6");
    			add_location(polyline0, file$6, 21, 6, 571);
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "class", "feather feather-chevron-left");
    			add_location(svg0, file$6, 11, 4, 327);
    			attr_dev(button0, "class", "svelte-irjjhy");
    			add_location(button0, file$6, 10, 2, 251);
    			attr_dev(p, "class", "svelte-irjjhy");
    			add_location(p, file$6, 24, 2, 643);
    			attr_dev(polyline1, "points", "9 18 15 12 9 6");
    			add_location(polyline1, file$6, 36, 6, 980);
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "class", "feather feather-chevron-right");
    			add_location(svg1, file$6, 26, 4, 735);
    			attr_dev(button1, "class", "svelte-irjjhy");
    			add_location(button1, file$6, 25, 2, 659);
    			attr_dev(div, "class", div_class_value = "bar " + /*custom*/ ctx[2] + " svelte-irjjhy");
    			add_location(div, file$6, 9, 0, 222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, polyline0);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, polyline1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*clue*/ 2) set_data_dev(t1, /*clue*/ ctx[1]);

    			if (dirty & /*custom*/ 4 && div_class_value !== (div_class_value = "bar " + /*custom*/ ctx[2] + " svelte-irjjhy")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClueBar", slots, []);
    	const dispatch = createEventDispatcher();
    	let { currentClue = {} } = $$props;
    	const writable_props = ["currentClue"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClueBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("nextClue", currentClue.index - 1);
    	const click_handler_1 = () => dispatch("nextClue", currentClue.index + 1);

    	$$self.$$set = $$props => {
    		if ("currentClue" in $$props) $$invalidate(0, currentClue = $$props.currentClue);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		currentClue,
    		clue,
    		custom
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentClue" in $$props) $$invalidate(0, currentClue = $$props.currentClue);
    		if ("clue" in $$props) $$invalidate(1, clue = $$props.clue);
    		if ("custom" in $$props) $$invalidate(2, custom = $$props.custom);
    	};

    	let clue;
    	let custom;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentClue*/ 1) {
    			 $$invalidate(1, clue = currentClue["clue"]);
    		}

    		if ($$self.$$.dirty & /*currentClue*/ 1) {
    			 $$invalidate(2, custom = currentClue["custom"] || "");
    		}
    	};

    	return [currentClue, clue, custom, dispatch, click_handler, click_handler_1];
    }

    class ClueBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { currentClue: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClueBar",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get currentClue() {
    		throw new Error("<ClueBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentClue(value) {
    		throw new Error("<ClueBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Clues.svelte generated by Svelte v3.29.0 */
    const file$7 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Clues.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (42:4) {#each ['across', 'down'] as direction}
    function create_each_block$4(ctx) {
    	let cluelist;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[12](/*direction*/ ctx[13], ...args);
    	}

    	cluelist = new ClueList({
    			props: {
    				direction: /*direction*/ ctx[13],
    				focusedClueNumbers: /*focusedClueNumbers*/ ctx[5],
    				clues: /*clues*/ ctx[1].filter(func),
    				isDirectionFocused: /*focusedDirection*/ ctx[0] === /*direction*/ ctx[13],
    				isDisableHighlight: /*isDisableHighlight*/ ctx[3],
    				onClueFocus: /*onClueFocus*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cluelist.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(cluelist.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cluelist, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const cluelist_changes = {};
    			if (dirty & /*focusedClueNumbers*/ 32) cluelist_changes.focusedClueNumbers = /*focusedClueNumbers*/ ctx[5];
    			if (dirty & /*clues*/ 2) cluelist_changes.clues = /*clues*/ ctx[1].filter(func);
    			if (dirty & /*focusedDirection*/ 1) cluelist_changes.isDirectionFocused = /*focusedDirection*/ ctx[0] === /*direction*/ ctx[13];
    			if (dirty & /*isDisableHighlight*/ 8) cluelist_changes.isDisableHighlight = /*isDisableHighlight*/ ctx[3];
    			cluelist.$set(cluelist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cluelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cluelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cluelist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(42:4) {#each ['across', 'down'] as direction}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let div0;
    	let cluebar;
    	let t;
    	let div1;
    	let current;

    	cluebar = new ClueBar({
    			props: { currentClue: /*currentClue*/ ctx[6] },
    			$$inline: true
    		});

    	cluebar.$on("nextClue", /*onNextClue*/ ctx[8]);
    	let each_value = ["across", "down"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 2; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(cluebar.$$.fragment);
    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			section = claim_element(nodes, "SECTION", { class: true });
    			var section_nodes = children(section);
    			div0 = claim_element(section_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			claim_component(cluebar.$$.fragment, div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t = claim_space(section_nodes);
    			div1 = claim_element(section_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].l(div1_nodes);
    			}

    			div1_nodes.forEach(detach_dev);
    			section_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "clues--stacked svelte-fisq29");
    			add_location(div0, file$7, 36, 2, 971);
    			attr_dev(div1, "class", "clues--list svelte-fisq29");
    			add_location(div1, file$7, 40, 2, 1069);
    			attr_dev(section, "class", "clues svelte-fisq29");
    			toggle_class(section, "stacked", /*stacked*/ ctx[2]);
    			toggle_class(section, "is-loaded", /*isLoaded*/ ctx[4]);
    			add_location(section, file$7, 35, 0, 902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(cluebar, div0, null);
    			append_dev(section, t);
    			append_dev(section, div1);

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const cluebar_changes = {};
    			if (dirty & /*currentClue*/ 64) cluebar_changes.currentClue = /*currentClue*/ ctx[6];
    			cluebar.$set(cluebar_changes);

    			if (dirty & /*focusedClueNumbers, clues, focusedDirection, isDisableHighlight, onClueFocus*/ 171) {
    				each_value = ["across", "down"];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < 2; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = 2; i < 2; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*stacked*/ 4) {
    				toggle_class(section, "stacked", /*stacked*/ ctx[2]);
    			}

    			if (dirty & /*isLoaded*/ 16) {
    				toggle_class(section, "is-loaded", /*isLoaded*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cluebar.$$.fragment, local);

    			for (let i = 0; i < 2; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cluebar.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < 2; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(cluebar);
    			destroy_each(each_blocks, detaching);
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

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clues", slots, []);
    	let { clues } = $$props;
    	let { cellIndexMap } = $$props;
    	let { focusedDirection } = $$props;
    	let { focusedCellIndex } = $$props;
    	let { focusedCell } = $$props;
    	let { stacked } = $$props;
    	let { isDisableHighlight } = $$props;
    	let { isLoaded } = $$props;

    	function onClueFocus({ direction, id }) {
    		$$invalidate(0, focusedDirection = direction);
    		$$invalidate(9, focusedCellIndex = cellIndexMap[id] || 0);
    	}

    	function onNextClue({ detail }) {
    		let next = detail;
    		if (next < 0) next = clues.length - 1; else if (next > clues.length - 1) next = 0;
    		const { direction, id } = clues[next];
    		onClueFocus({ direction, id });
    	}

    	const writable_props = [
    		"clues",
    		"cellIndexMap",
    		"focusedDirection",
    		"focusedCellIndex",
    		"focusedCell",
    		"stacked",
    		"isDisableHighlight",
    		"isLoaded"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clues> was created with unknown prop '${key}'`);
    	});

    	const func = (direction, d) => d.direction === direction;

    	$$self.$$set = $$props => {
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("cellIndexMap" in $$props) $$invalidate(10, cellIndexMap = $$props.cellIndexMap);
    		if ("focusedDirection" in $$props) $$invalidate(0, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(9, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(11, focusedCell = $$props.focusedCell);
    		if ("stacked" in $$props) $$invalidate(2, stacked = $$props.stacked);
    		if ("isDisableHighlight" in $$props) $$invalidate(3, isDisableHighlight = $$props.isDisableHighlight);
    		if ("isLoaded" in $$props) $$invalidate(4, isLoaded = $$props.isLoaded);
    	};

    	$$self.$capture_state = () => ({
    		ClueList,
    		ClueBar,
    		clues,
    		cellIndexMap,
    		focusedDirection,
    		focusedCellIndex,
    		focusedCell,
    		stacked,
    		isDisableHighlight,
    		isLoaded,
    		onClueFocus,
    		onNextClue,
    		focusedClueNumbers,
    		currentClue
    	});

    	$$self.$inject_state = $$props => {
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("cellIndexMap" in $$props) $$invalidate(10, cellIndexMap = $$props.cellIndexMap);
    		if ("focusedDirection" in $$props) $$invalidate(0, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(9, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(11, focusedCell = $$props.focusedCell);
    		if ("stacked" in $$props) $$invalidate(2, stacked = $$props.stacked);
    		if ("isDisableHighlight" in $$props) $$invalidate(3, isDisableHighlight = $$props.isDisableHighlight);
    		if ("isLoaded" in $$props) $$invalidate(4, isLoaded = $$props.isLoaded);
    		if ("focusedClueNumbers" in $$props) $$invalidate(5, focusedClueNumbers = $$props.focusedClueNumbers);
    		if ("currentClue" in $$props) $$invalidate(6, currentClue = $$props.currentClue);
    	};

    	let focusedClueNumbers;
    	let currentClue;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focusedCell*/ 2048) {
    			 $$invalidate(5, focusedClueNumbers = focusedCell.clueNumbers || {});
    		}

    		if ($$self.$$.dirty & /*clues, focusedDirection, focusedClueNumbers*/ 35) {
    			 $$invalidate(6, currentClue = clues.find(c => c.direction === focusedDirection && c.number === focusedClueNumbers[focusedDirection]) || {});
    		}
    	};

    	return [
    		focusedDirection,
    		clues,
    		stacked,
    		isDisableHighlight,
    		isLoaded,
    		focusedClueNumbers,
    		currentClue,
    		onClueFocus,
    		onNextClue,
    		focusedCellIndex,
    		cellIndexMap,
    		focusedCell,
    		func
    	];
    }

    class Clues extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			clues: 1,
    			cellIndexMap: 10,
    			focusedDirection: 0,
    			focusedCellIndex: 9,
    			focusedCell: 11,
    			stacked: 2,
    			isDisableHighlight: 3,
    			isLoaded: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clues",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*clues*/ ctx[1] === undefined && !("clues" in props)) {
    			console.warn("<Clues> was created without expected prop 'clues'");
    		}

    		if (/*cellIndexMap*/ ctx[10] === undefined && !("cellIndexMap" in props)) {
    			console.warn("<Clues> was created without expected prop 'cellIndexMap'");
    		}

    		if (/*focusedDirection*/ ctx[0] === undefined && !("focusedDirection" in props)) {
    			console.warn("<Clues> was created without expected prop 'focusedDirection'");
    		}

    		if (/*focusedCellIndex*/ ctx[9] === undefined && !("focusedCellIndex" in props)) {
    			console.warn("<Clues> was created without expected prop 'focusedCellIndex'");
    		}

    		if (/*focusedCell*/ ctx[11] === undefined && !("focusedCell" in props)) {
    			console.warn("<Clues> was created without expected prop 'focusedCell'");
    		}

    		if (/*stacked*/ ctx[2] === undefined && !("stacked" in props)) {
    			console.warn("<Clues> was created without expected prop 'stacked'");
    		}

    		if (/*isDisableHighlight*/ ctx[3] === undefined && !("isDisableHighlight" in props)) {
    			console.warn("<Clues> was created without expected prop 'isDisableHighlight'");
    		}

    		if (/*isLoaded*/ ctx[4] === undefined && !("isLoaded" in props)) {
    			console.warn("<Clues> was created without expected prop 'isLoaded'");
    		}
    	}

    	get clues() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clues(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cellIndexMap() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cellIndexMap(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedDirection() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedDirection(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCellIndex() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCellIndex(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCell() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCell(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stacked() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stacked(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisableHighlight() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisableHighlight(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLoaded() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLoaded(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function quadIn(t) {
        return t * t;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Confetti.svelte generated by Svelte v3.29.0 */
    const file$8 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Confetti.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i][0];
    	child_ctx[9] = list[i][1];
    	child_ctx[10] = list[i][2];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (45:2) {#each allElements as [element, color, scale], i}
    function create_each_block$5(ctx) {
    	let g1;
    	let g0;
    	let raw_value = /*element*/ ctx[8] + "";
    	let g0_fill_value;
    	let g0_style_value;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			this.h();
    		},
    		l: function claim(nodes) {
    			g1 = claim_element(nodes, "g", { style: true, class: true }, 1);
    			var g1_nodes = children(g1);
    			g0 = claim_element(g1_nodes, "g", { fill: true, style: true, class: true }, 1);
    			var g0_nodes = children(g0);
    			g0_nodes.forEach(detach_dev);
    			g1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(g0, "fill", g0_fill_value = /*color*/ ctx[9]);

    			attr_dev(g0, "style", g0_style_value = [
    				`--rotation: ${Math.random() * 360}deg`,
    				`animation-delay: ${quadIn(/*i*/ ctx[12] / /*numberOfElements*/ ctx[0])}s`,
    				`animation-duration: ${/*durationInSeconds*/ ctx[1] * /*randomNumber*/ ctx[2](0.7, 1)}s`
    			].join(";"));

    			attr_dev(g0, "class", "svelte-15wt7c8");
    			add_location(g0, file$8, 46, 6, 2525);
    			set_style(g1, "transform", "scale(" + /*scale*/ ctx[10] + ")");
    			attr_dev(g1, "class", "svelte-15wt7c8");
    			add_location(g1, file$8, 45, 4, 2481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, g0);
    			g0.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*numberOfElements, durationInSeconds*/ 3 && g0_style_value !== (g0_style_value = [
    				`--rotation: ${Math.random() * 360}deg`,
    				`animation-delay: ${quadIn(/*i*/ ctx[12] / /*numberOfElements*/ ctx[0])}s`,
    				`animation-duration: ${/*durationInSeconds*/ ctx[1] * /*randomNumber*/ ctx[2](0.7, 1)}s`
    			].join(";"))) {
    				attr_dev(g0, "style", g0_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(45:2) {#each allElements as [element, color, scale], i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svg;
    	let each_value = /*allElements*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			svg = claim_element(nodes, "svg", { class: true, viewBox: true }, 1);
    			var svg_nodes = children(svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(svg_nodes);
    			}

    			svg_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(svg, "class", "confetti svelte-15wt7c8");
    			attr_dev(svg, "viewBox", "-10 -10 10 10");
    			add_location(svg, file$8, 43, 0, 2378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*allElements, Math, quadIn, numberOfElements, durationInSeconds, randomNumber*/ 15) {
    				each_value = /*allElements*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Confetti", slots, []);
    	let { numberOfElements = 50 } = $$props;
    	let { durationInSeconds = 2 } = $$props;

    	let { colors = [
    		"#fff",
    		"#c7ecee",
    		"#778beb",
    		"#f7d794",
    		"#63cdda",
    		"#cf6a87",
    		"#e77f67",
    		"#786fa6",
    		"#FDA7DF",
    		"#4b7bec",
    		"#475c83"
    	] } = $$props;

    	const pickFrom = arr => arr[Math.round(Math.random() * arr.length)];
    	const randomNumber = (min, max) => Math.random() * (max - min) + min;
    	const getManyOf = str => new Array(30).fill(0).map(() => str);

    	const elementOptions = [
    		...getManyOf(`<circle r="3" />`),
    		...getManyOf(`<path d="M3.83733 4.73234C4.38961 4.73234 4.83733 4.28463 4.83733 3.73234C4.83733 3.18006 4.38961 2.73234 3.83733 2.73234C3.28505 2.73234 2.83733 3.18006 2.83733 3.73234C2.83733 4.28463 3.28505 4.73234 3.83733 4.73234ZM3.83733 6.73234C5.49418 6.73234 6.83733 5.38919 6.83733 3.73234C6.83733 2.07549 5.49418 0.732341 3.83733 0.732341C2.18048 0.732341 0.83733 2.07549 0.83733 3.73234C0.83733 5.38919 2.18048 6.73234 3.83733 6.73234Z" />`),
    		...getManyOf(`<path d="M4.29742 2.26041C3.86864 2.1688 3.20695 2.21855 2.13614 3.0038C1.69078 3.33041 1.06498 3.23413 0.738375 2.78876C0.411774 2.3434 0.508051 1.7176 0.953417 1.39099C2.32237 0.387097 3.55827 0.0573281 4.71534 0.304565C5.80081 0.536504 6.61625 1.24716 7.20541 1.78276C7.28295 1.85326 7.35618 1.92051 7.4263 1.9849C7.64841 2.18888 7.83929 2.36418 8.03729 2.52315C8.29108 2.72692 8.48631 2.8439 8.64952 2.90181C8.7915 2.95219 8.91895 2.96216 9.07414 2.92095C9.24752 2.8749 9.5134 2.7484 9.88467 2.42214C10.2995 2.05757 10.9314 2.09833 11.2959 2.51319C11.6605 2.92805 11.6198 3.5599 11.2049 3.92447C10.6816 4.38435 10.1478 4.70514 9.58752 4.85394C9.00909 5.00756 8.469 4.95993 7.9807 4.78667C7.51364 4.62093 7.11587 4.34823 6.78514 4.08268C6.53001 3.87783 6.27248 3.64113 6.04114 3.4285C5.97868 3.37109 5.91814 3.31544 5.86006 3.26264C5.25645 2.7139 4.79779 2.36733 4.29742 2.26041Z" />`),
    		...getManyOf(`<rect width="4" height="4" x="-2" y="-2" />`),
    		`<path d="M -5 5 L 0 -5 L 5 5 Z" />`,
    		...("ABCDEFGHIJKLMNOPQRSTUVWXYZ").split("").map(letter => `<text style="font-weight: 700">${letter}</text>`)
    	];

    	const allElements = new Array(numberOfElements).fill(0).map((_, i) => [pickFrom(elementOptions), pickFrom(colors), Math.random()]);
    	const writable_props = ["numberOfElements", "durationInSeconds", "colors"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Confetti> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("numberOfElements" in $$props) $$invalidate(0, numberOfElements = $$props.numberOfElements);
    		if ("durationInSeconds" in $$props) $$invalidate(1, durationInSeconds = $$props.durationInSeconds);
    		if ("colors" in $$props) $$invalidate(4, colors = $$props.colors);
    	};

    	$$self.$capture_state = () => ({
    		quadIn,
    		numberOfElements,
    		durationInSeconds,
    		colors,
    		pickFrom,
    		randomNumber,
    		getManyOf,
    		elementOptions,
    		allElements
    	});

    	$$self.$inject_state = $$props => {
    		if ("numberOfElements" in $$props) $$invalidate(0, numberOfElements = $$props.numberOfElements);
    		if ("durationInSeconds" in $$props) $$invalidate(1, durationInSeconds = $$props.durationInSeconds);
    		if ("colors" in $$props) $$invalidate(4, colors = $$props.colors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [numberOfElements, durationInSeconds, randomNumber, allElements, colors];
    }

    class Confetti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			numberOfElements: 0,
    			durationInSeconds: 1,
    			colors: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get numberOfElements() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numberOfElements(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get durationInSeconds() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set durationInSeconds(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/CompletedMessage.svelte generated by Svelte v3.29.0 */
    const file$9 = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/CompletedMessage.svelte";

    // (10:0) {#if isOpen}
    function create_if_block$4(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let button;
    	let t1;
    	let t2;
    	let div2_transition;
    	let t3;
    	let div3;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	let if_block = /*showConfetti*/ ctx[0] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			button = element("button");
    			t1 = text("View puzzle");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div3 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(div1_nodes);
    			button = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			t1 = claim_text(button_nodes, "View puzzle");
    			button_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t2 = claim_space(div2_nodes);
    			if (if_block) if_block.l(div2_nodes);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			div3 = claim_element(nodes, "DIV", { class: true });
    			children(div3).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "message svelte-hm3hg2");
    			add_location(div0, file$9, 12, 6, 266);
    			attr_dev(button, "class", "svelte-hm3hg2");
    			add_location(button, file$9, 16, 6, 325);
    			attr_dev(div1, "class", "content svelte-hm3hg2");
    			add_location(div1, file$9, 11, 4, 238);
    			attr_dev(div2, "class", "completed svelte-hm3hg2");
    			add_location(div2, file$9, 10, 2, 180);
    			attr_dev(div3, "class", "curtain svelte-hm3hg2");
    			add_location(div3, file$9, 25, 2, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, button);
    			append_dev(button, t1);
    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(div3, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (/*showConfetti*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*showConfetti*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
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
    			transition_in(default_slot, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { y: 20 }, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 250 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { y: 20 }, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 250 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(10:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if showConfetti}
    function create_if_block_1$2(ctx) {
    	let div;
    	let confetti;
    	let current;
    	confetti = new Confetti({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(confetti.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(confetti.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "confetti svelte-hm3hg2");
    			add_location(div, file$9, 20, 6, 431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(confetti, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(confetti);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(20:4) {#if showConfetti}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CompletedMessage", slots, ['default']);
    	let { showConfetti = true } = $$props;
    	let isOpen = true;
    	const writable_props = ["showConfetti"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CompletedMessage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, isOpen = false);
    	const click_handler_1 = () => $$invalidate(1, isOpen = false);

    	$$self.$$set = $$props => {
    		if ("showConfetti" in $$props) $$invalidate(0, showConfetti = $$props.showConfetti);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade, Confetti, showConfetti, isOpen });

    	$$self.$inject_state = $$props => {
    		if ("showConfetti" in $$props) $$invalidate(0, showConfetti = $$props.showConfetti);
    		if ("isOpen" in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showConfetti, isOpen, $$scope, slots, click_handler, click_handler_1];
    }

    class CompletedMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { showConfetti: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompletedMessage",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get showConfetti() {
    		throw new Error("<CompletedMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showConfetti(value) {
    		throw new Error("<CompletedMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createClues(data) {
    	// determine if 0 or 1 based
    	const minX = Math.min(...data.map(d => d.x));
    	const minY = Math.min(...data.map(d => d.y));
    	const adjust = Math.min(minX, minY);

    	
    	const withAdjust = data.map(d => ({
    		...d,
    		x: d.x - adjust,
    		y: d.y - adjust
    	}));

      const withId = withAdjust.map((d, i) => ({
    		...d,
        id: `${d.x}-${d.y}`,
      }));
    	
      // sort asc by start position of clue so we have proper clue ordering
      withId.sort((a, b) => a.y - b.y || a.x - b.x);

      // create a lookup to store clue number (and reuse if same start pos)
      let lookup = {};
      let currentNumber = 1;

      const withNumber = withId.map((d) => {
        let number;
        if (lookup[d.id]) number = lookup[d.id];
        else {
          lookup[d.id] = number = currentNumber;
          currentNumber += 1;
        }
        return {
          ...d,
          number,
        };
      });


    	// create cells for each letter
    	const withCells = withNumber.map(d => {
    		const chars = d.answer.split("");
        const cells = chars.map((answer, i) => {
          const x = d.x + (d.direction === "across" ? i : 0);
          const y = d.y + (d.direction === "down" ? i : 0);
          const number = i === 0 ? d.number : "";
          const clueNumbers = { [d.direction]: d.number };
          const id = `${x}-${y}`;
          const value = "";
          const custom = d.custom || "";
          return {
            id,
            number,
            clueNumbers,
            x,
            y,
            value,
            answer: answer.toUpperCase(),
            custom,
          };
        });
    		return {
    			...d,
    			cells
    		}
    	});

    	withCells.sort((a, b) => {
    		if (a.direction < b.direction) return -1;
    		else if (a.direction > b.direction) return 1;
    		return a.number - b.number;
    	});
    	const withIndex = withCells.map((d, i) => ({
    		...d,
    		index: i
    	}));
    	return withIndex;
    }

    function createCells(data) {
      const cells = [].concat(...data.map(d => d.cells));
      let dict = {};

      // sort so that ones with number values come first and dedupe
      cells.sort((a, b) => a.y - b.y || a.x - b.x || b.number - a.number);
      cells.forEach((d) => {
        if (!dict[d.id]) {
          dict[d.id] = d;
        } else {
          // consolidate clue numbers for across & down
          dict[d.id].clueNumbers = {
            ...d.clueNumbers,
            ...dict[d.id].clueNumbers,
          };
          // consolidate custom classes
          if (dict[d.id].custom !== d.custom)
            dict[d.id].custom = `${dict[d.id].custom} ${d.custom}`;
        }
      });

      const unique = Object.keys(dict).map((d) => dict[d]);
      unique.sort((a, b) => a.y - b.y || a.x - b.x);
      // add index
      const output = unique.map((d, i) => ({ ...d, index: i }));
      return output;
    }

    function validateClues(data) {
    	const props = [
        {
          prop: "clue",
          type: "string",
        },
        {
          prop: "answer",
          type: "string",
        },
        {
          prop: "x",
          type: "number",
        },
        {
          prop: "y",
          type: "number",
        }
      ];

    	// only store if they fail
    	let failedProp = false;
      data.forEach(d => !!props.map(p => {
    		const f = typeof d[p.prop] !== p.type;
    		if (f) {
    			failedProp = true;
    			console.error(`"${p.prop}" is not a ${p.type}\n`, d);
    		}
    	}));

    	let failedCell = false;
    	const cells = [].concat(...data.map(d => d.cells));
    	
    	let dict = {};
    	cells.forEach((d) => {
        if (!dict[d.id]) {
          dict[d.id] = d.answer;
        } else {
    			if (dict[d.id] !== d.answer) {
    				failedCell = true;
    				console.error(`cell "${d.id}" has two different values\n`, `${dict[d.id]} and ${d.answer}`);
    			}
    		}
      });

    	return !failedProp && !failedCell;
    }

    function fromPairs(arr) {
      let res = {};
      arr.forEach((d) => {
        res[d[0]] = d[1];
      });
      return res;
    }

    var classic = {
    	"font": "sans-serif",
    	"primary-highlight-color": "#ffda00",
    	"secondary-highlight-color": "#a7d8ff",
    	"main-color": "#1a1a1a",
    	"bg-color": "#fff",
    	"accent-color": "#efefef",
    	"scrollbar-color": "#cdcdcd",
    	"order": "row"
    };

    var dark = {
    	"primary-highlight-color": "#066",
    	"secondary-highlight-color": "#003d3d",
    	"main-color": "#efefef",
    	"bg-color": "#1a1a1a",
    	"accent-color": "#3a3a3a"
    };

    var citrus = {
    	"primary-highlight-color": "#ff957d",
    	"secondary-highlight-color": "#ffdfd5",
    	"main-color": "#184444",
    	"accent-color": "#ebf3f3"
    };

    var amelia = {
    	"font": "sans-serif",
    	"primary-highlight-color": "#d7cefd",
    	"secondary-highlight-color": "#9980fa",
    	"main-color": "#353b48",
    	"bg-color": "#fff",
    	"accent-color": "#efefef",
    	"scrollbar-color": "#9980fa",
    };

    const themes = { classic, dark, citrus, amelia };
    const defaultTheme = themes["classic"];

    Object.keys(themes).forEach((t) => {
    	themes[t] = Object.keys(defaultTheme)
    		.map((d) => `--${d}: var(--xd-${d}, ${themes[t][d] || defaultTheme[d]})`)
    		.join(";");
    });

    /* Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Crossword.svelte generated by Svelte v3.29.0 */
    const file$a = "Users/zachary/Desktop/hackathon/mhacks-16-comp/website/src/Crossword.svelte";
    const get_message_slot_changes = dirty => ({});
    const get_message_slot_context = ctx => ({});
    const get_toolbar_slot_changes = dirty => ({});

    const get_toolbar_slot_context = ctx => ({
    	onClear: /*onClear*/ ctx[21],
    	onReveal: /*onReveal*/ ctx[22],
    	onCheck: /*onCheck*/ ctx[23]
    });

    // (130:0) {#if validated}
    function create_if_block$5(ctx) {
    	let article;
    	let t0;
    	let div;
    	let clues_1;
    	let updating_focusedCellIndex;
    	let updating_focusedCell;
    	let updating_focusedDirection;
    	let t1;
    	let puzzle;
    	let updating_cells;
    	let updating_focusedCellIndex_1;
    	let updating_focusedDirection_1;
    	let t2;
    	let article_resize_listener;
    	let current;
    	const toolbar_slot_template = /*#slots*/ ctx[30].toolbar;
    	const toolbar_slot = create_slot(toolbar_slot_template, ctx, /*$$scope*/ ctx[38], get_toolbar_slot_context);
    	const toolbar_slot_or_fallback = toolbar_slot || fallback_block_1(ctx);

    	function clues_1_focusedCellIndex_binding(value) {
    		/*clues_1_focusedCellIndex_binding*/ ctx[31].call(null, value);
    	}

    	function clues_1_focusedCell_binding(value) {
    		/*clues_1_focusedCell_binding*/ ctx[32].call(null, value);
    	}

    	function clues_1_focusedDirection_binding(value) {
    		/*clues_1_focusedDirection_binding*/ ctx[33].call(null, value);
    	}

    	let clues_1_props = {
    		clues: /*clues*/ ctx[13],
    		cellIndexMap: /*cellIndexMap*/ ctx[16],
    		stacked: /*stacked*/ ctx[19],
    		isDisableHighlight: /*isDisableHighlight*/ ctx[18],
    		isLoaded: /*isLoaded*/ ctx[10]
    	};

    	if (/*focusedCellIndex*/ ctx[8] !== void 0) {
    		clues_1_props.focusedCellIndex = /*focusedCellIndex*/ ctx[8];
    	}

    	if (/*focusedCell*/ ctx[15] !== void 0) {
    		clues_1_props.focusedCell = /*focusedCell*/ ctx[15];
    	}

    	if (/*focusedDirection*/ ctx[7] !== void 0) {
    		clues_1_props.focusedDirection = /*focusedDirection*/ ctx[7];
    	}

    	clues_1 = new Clues({ props: clues_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(clues_1, "focusedCellIndex", clues_1_focusedCellIndex_binding));
    	binding_callbacks.push(() => bind(clues_1, "focusedCell", clues_1_focusedCell_binding));
    	binding_callbacks.push(() => bind(clues_1, "focusedDirection", clues_1_focusedDirection_binding));

    	function puzzle_cells_binding(value) {
    		/*puzzle_cells_binding*/ ctx[34].call(null, value);
    	}

    	function puzzle_focusedCellIndex_binding(value) {
    		/*puzzle_focusedCellIndex_binding*/ ctx[35].call(null, value);
    	}

    	function puzzle_focusedDirection_binding(value) {
    		/*puzzle_focusedDirection_binding*/ ctx[36].call(null, value);
    	}

    	let puzzle_props = {
    		clues: /*clues*/ ctx[13],
    		focusedCell: /*focusedCell*/ ctx[15],
    		isRevealing: /*isRevealing*/ ctx[9],
    		isChecking: /*isChecking*/ ctx[11],
    		isDisableHighlight: /*isDisableHighlight*/ ctx[18],
    		revealDuration: /*revealDuration*/ ctx[1],
    		showKeyboard: /*showKeyboard*/ ctx[4],
    		stacked: /*stacked*/ ctx[19],
    		isLoaded: /*isLoaded*/ ctx[10],
    		keyboardStyle: /*keyboardStyle*/ ctx[5]
    	};

    	if (/*cells*/ ctx[14] !== void 0) {
    		puzzle_props.cells = /*cells*/ ctx[14];
    	}

    	if (/*focusedCellIndex*/ ctx[8] !== void 0) {
    		puzzle_props.focusedCellIndex = /*focusedCellIndex*/ ctx[8];
    	}

    	if (/*focusedDirection*/ ctx[7] !== void 0) {
    		puzzle_props.focusedDirection = /*focusedDirection*/ ctx[7];
    	}

    	puzzle = new Puzzle({ props: puzzle_props, $$inline: true });
    	binding_callbacks.push(() => bind(puzzle, "cells", puzzle_cells_binding));
    	binding_callbacks.push(() => bind(puzzle, "focusedCellIndex", puzzle_focusedCellIndex_binding));
    	binding_callbacks.push(() => bind(puzzle, "focusedDirection", puzzle_focusedDirection_binding));
    	let if_block = /*isComplete*/ ctx[17] && !/*isRevealing*/ ctx[9] && /*showCompleteMessage*/ ctx[2] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.c();
    			t0 = space();
    			div = element("div");
    			create_component(clues_1.$$.fragment);
    			t1 = space();
    			create_component(puzzle.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			article = claim_element(nodes, "ARTICLE", { class: true, style: true });
    			var article_nodes = children(article);
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.l(article_nodes);
    			t0 = claim_space(article_nodes);
    			div = claim_element(article_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(clues_1.$$.fragment, div_nodes);
    			t1 = claim_space(div_nodes);
    			claim_component(puzzle.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			t2 = claim_space(article_nodes);
    			if (if_block) if_block.l(article_nodes);
    			article_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "play svelte-186p9qm");
    			toggle_class(div, "stacked", /*stacked*/ ctx[19]);
    			toggle_class(div, "is-loaded", /*isLoaded*/ ctx[10]);
    			add_location(div, file$a, 142, 4, 3821);
    			attr_dev(article, "class", "svelte-crossword svelte-186p9qm");
    			attr_dev(article, "style", /*inlineStyles*/ ctx[20]);
    			add_render_callback(() => /*article_elementresize_handler*/ ctx[37].call(article));
    			add_location(article, file$a, 130, 2, 3529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);

    			if (toolbar_slot_or_fallback) {
    				toolbar_slot_or_fallback.m(article, null);
    			}

    			append_dev(article, t0);
    			append_dev(article, div);
    			mount_component(clues_1, div, null);
    			append_dev(div, t1);
    			mount_component(puzzle, div, null);
    			append_dev(article, t2);
    			if (if_block) if_block.m(article, null);
    			article_resize_listener = add_resize_listener(article, /*article_elementresize_handler*/ ctx[37].bind(article));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (toolbar_slot) {
    				if (toolbar_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(toolbar_slot, toolbar_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_toolbar_slot_changes, get_toolbar_slot_context);
    				}
    			} else {
    				if (toolbar_slot_or_fallback && toolbar_slot_or_fallback.p && dirty[0] & /*actions*/ 1) {
    					toolbar_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			const clues_1_changes = {};
    			if (dirty[0] & /*clues*/ 8192) clues_1_changes.clues = /*clues*/ ctx[13];
    			if (dirty[0] & /*cellIndexMap*/ 65536) clues_1_changes.cellIndexMap = /*cellIndexMap*/ ctx[16];
    			if (dirty[0] & /*stacked*/ 524288) clues_1_changes.stacked = /*stacked*/ ctx[19];
    			if (dirty[0] & /*isDisableHighlight*/ 262144) clues_1_changes.isDisableHighlight = /*isDisableHighlight*/ ctx[18];
    			if (dirty[0] & /*isLoaded*/ 1024) clues_1_changes.isLoaded = /*isLoaded*/ ctx[10];

    			if (!updating_focusedCellIndex && dirty[0] & /*focusedCellIndex*/ 256) {
    				updating_focusedCellIndex = true;
    				clues_1_changes.focusedCellIndex = /*focusedCellIndex*/ ctx[8];
    				add_flush_callback(() => updating_focusedCellIndex = false);
    			}

    			if (!updating_focusedCell && dirty[0] & /*focusedCell*/ 32768) {
    				updating_focusedCell = true;
    				clues_1_changes.focusedCell = /*focusedCell*/ ctx[15];
    				add_flush_callback(() => updating_focusedCell = false);
    			}

    			if (!updating_focusedDirection && dirty[0] & /*focusedDirection*/ 128) {
    				updating_focusedDirection = true;
    				clues_1_changes.focusedDirection = /*focusedDirection*/ ctx[7];
    				add_flush_callback(() => updating_focusedDirection = false);
    			}

    			clues_1.$set(clues_1_changes);
    			const puzzle_changes = {};
    			if (dirty[0] & /*clues*/ 8192) puzzle_changes.clues = /*clues*/ ctx[13];
    			if (dirty[0] & /*focusedCell*/ 32768) puzzle_changes.focusedCell = /*focusedCell*/ ctx[15];
    			if (dirty[0] & /*isRevealing*/ 512) puzzle_changes.isRevealing = /*isRevealing*/ ctx[9];
    			if (dirty[0] & /*isChecking*/ 2048) puzzle_changes.isChecking = /*isChecking*/ ctx[11];
    			if (dirty[0] & /*isDisableHighlight*/ 262144) puzzle_changes.isDisableHighlight = /*isDisableHighlight*/ ctx[18];
    			if (dirty[0] & /*revealDuration*/ 2) puzzle_changes.revealDuration = /*revealDuration*/ ctx[1];
    			if (dirty[0] & /*showKeyboard*/ 16) puzzle_changes.showKeyboard = /*showKeyboard*/ ctx[4];
    			if (dirty[0] & /*stacked*/ 524288) puzzle_changes.stacked = /*stacked*/ ctx[19];
    			if (dirty[0] & /*isLoaded*/ 1024) puzzle_changes.isLoaded = /*isLoaded*/ ctx[10];
    			if (dirty[0] & /*keyboardStyle*/ 32) puzzle_changes.keyboardStyle = /*keyboardStyle*/ ctx[5];

    			if (!updating_cells && dirty[0] & /*cells*/ 16384) {
    				updating_cells = true;
    				puzzle_changes.cells = /*cells*/ ctx[14];
    				add_flush_callback(() => updating_cells = false);
    			}

    			if (!updating_focusedCellIndex_1 && dirty[0] & /*focusedCellIndex*/ 256) {
    				updating_focusedCellIndex_1 = true;
    				puzzle_changes.focusedCellIndex = /*focusedCellIndex*/ ctx[8];
    				add_flush_callback(() => updating_focusedCellIndex_1 = false);
    			}

    			if (!updating_focusedDirection_1 && dirty[0] & /*focusedDirection*/ 128) {
    				updating_focusedDirection_1 = true;
    				puzzle_changes.focusedDirection = /*focusedDirection*/ ctx[7];
    				add_flush_callback(() => updating_focusedDirection_1 = false);
    			}

    			puzzle.$set(puzzle_changes);

    			if (dirty[0] & /*stacked*/ 524288) {
    				toggle_class(div, "stacked", /*stacked*/ ctx[19]);
    			}

    			if (dirty[0] & /*isLoaded*/ 1024) {
    				toggle_class(div, "is-loaded", /*isLoaded*/ ctx[10]);
    			}

    			if (/*isComplete*/ ctx[17] && !/*isRevealing*/ ctx[9] && /*showCompleteMessage*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isComplete, isRevealing, showCompleteMessage*/ 131588) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(article, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*inlineStyles*/ 1048576) {
    				attr_dev(article, "style", /*inlineStyles*/ ctx[20]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbar_slot_or_fallback, local);
    			transition_in(clues_1.$$.fragment, local);
    			transition_in(puzzle.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbar_slot_or_fallback, local);
    			transition_out(clues_1.$$.fragment, local);
    			transition_out(puzzle.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.d(detaching);
    			destroy_component(clues_1);
    			destroy_component(puzzle);
    			if (if_block) if_block.d();
    			article_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(130:0) {#if validated}",
    		ctx
    	});

    	return block;
    }

    // (139:26)        
    function fallback_block_1(ctx) {
    	let toolbar;
    	let current;

    	toolbar = new Toolbar({
    			props: { actions: /*actions*/ ctx[0] },
    			$$inline: true
    		});

    	toolbar.$on("event", /*onToolbarEvent*/ ctx[24]);

    	const block = {
    		c: function create() {
    			create_component(toolbar.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(toolbar.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toolbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toolbar_changes = {};
    			if (dirty[0] & /*actions*/ 1) toolbar_changes.actions = /*actions*/ ctx[0];
    			toolbar.$set(toolbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toolbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(139:26)        ",
    		ctx
    	});

    	return block;
    }

    // (169:4) {#if isComplete && !isRevealing && showCompleteMessage}
    function create_if_block_1$3(ctx) {
    	let completedmessage;
    	let current;

    	completedmessage = new CompletedMessage({
    			props: {
    				showConfetti: /*showConfetti*/ ctx[3],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(completedmessage.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(completedmessage.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(completedmessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const completedmessage_changes = {};
    			if (dirty[0] & /*showConfetti*/ 8) completedmessage_changes.showConfetti = /*showConfetti*/ ctx[3];

    			if (dirty[1] & /*$$scope*/ 128) {
    				completedmessage_changes.$$scope = { dirty, ctx };
    			}

    			completedmessage.$set(completedmessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(completedmessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(completedmessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(completedmessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(169:4) {#if isComplete && !isRevealing && showCompleteMessage}",
    		ctx
    	});

    	return block;
    }

    // (171:29)            
    function fallback_block(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text("You solved it!");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h3 = claim_element(nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t = claim_text(h3_nodes, "You solved it!");
    			h3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "svelte-186p9qm");
    			add_location(h3, file$a, 171, 10, 4775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(171:29)            ",
    		ctx
    	});

    	return block;
    }

    // (170:6) <CompletedMessage showConfetti="{showConfetti}">
    function create_default_slot(ctx) {
    	let current;
    	const message_slot_template = /*#slots*/ ctx[30].message;
    	const message_slot = create_slot(message_slot_template, ctx, /*$$scope*/ ctx[38], get_message_slot_context);
    	const message_slot_or_fallback = message_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (message_slot_or_fallback) message_slot_or_fallback.c();
    		},
    		l: function claim(nodes) {
    			if (message_slot_or_fallback) message_slot_or_fallback.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (message_slot_or_fallback) {
    				message_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (message_slot) {
    				if (message_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(message_slot, message_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_message_slot_changes, get_message_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(message_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(message_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (message_slot_or_fallback) message_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(170:6) <CompletedMessage showConfetti=\\\"{showConfetti}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*validated*/ ctx[12] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*validated*/ ctx[12]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*validated*/ 4096) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Crossword", slots, ['toolbar','message']);
    	let { data = [] } = $$props;
    	let { actions = ["clear", "reveal", "check"] } = $$props;
    	let { theme = "classic" } = $$props;
    	let { revealDuration = 1000 } = $$props;
    	let { breakpoint = 720 } = $$props;
    	let { revealed = false } = $$props;
    	let { disableHighlight = false } = $$props;
    	let { showCompleteMessage = true } = $$props;
    	let { showConfetti = true } = $$props;
    	let { showKeyboard } = $$props;
    	let { keyboardStyle = "outline" } = $$props;
    	let width = 0;
    	let focusedDirection = "across";
    	let focusedCellIndex = 0;
    	let isRevealing = false;
    	let isLoaded = false;
    	let isChecking = false;
    	let revealTimeout;
    	let clueCompletion;
    	let originalClues = [];
    	let validated = [];
    	let clues = [];
    	let cells = [];

    	const onDataUpdate = () => {
    		originalClues = createClues(data);
    		$$invalidate(12, validated = validateClues(originalClues));
    		$$invalidate(13, clues = originalClues.map(d => ({ ...d })));
    		$$invalidate(14, cells = createCells(originalClues));
    		reset();
    	};

    	onMount(() => {
    		$$invalidate(10, isLoaded = true);
    	});

    	function checkClues() {
    		return clues.map(d => {
    			const index = d.index;

    			const cellChecks = d.cells.map(c => {
    				const { value } = cells.find(e => e.id === c.id);
    				const hasValue = !!value;
    				const hasCorrect = value === c.answer;
    				return { hasValue, hasCorrect };
    			});

    			const isCorrect = cellChecks.filter(c => c.hasCorrect).length === d.answer.length;
    			const isFilled = cellChecks.filter(c => c.hasValue).length === d.answer.length;
    			return { ...d, isCorrect, isFilled };
    		});
    	}

    	function reset() {
    		$$invalidate(9, isRevealing = false);
    		$$invalidate(11, isChecking = false);
    		$$invalidate(8, focusedCellIndex = 0);
    		$$invalidate(7, focusedDirection = "across");
    	}

    	function onClear() {
    		reset();
    		if (revealTimeout) clearTimeout(revealTimeout);
    		$$invalidate(14, cells = cells.map(cell => ({ ...cell, value: "" })));
    	}

    	function onReveal() {
    		if (revealed) return true;
    		reset();
    		$$invalidate(14, cells = cells.map(cell => ({ ...cell, value: cell.answer })));
    		startReveal();
    	}

    	function onCheck() {
    		$$invalidate(11, isChecking = true);
    	}

    	function startReveal() {
    		$$invalidate(9, isRevealing = true);
    		$$invalidate(11, isChecking = false);
    		if (revealTimeout) clearTimeout(revealTimeout);

    		revealTimeout = setTimeout(
    			() => {
    				$$invalidate(9, isRevealing = false);
    			},
    			revealDuration + 250
    		);
    	}

    	function onToolbarEvent({ detail }) {
    		if (detail === "clear") onClear(); else if (detail === "reveal") onReveal(); else if (detail === "check") onCheck();
    	}

    	const writable_props = [
    		"data",
    		"actions",
    		"theme",
    		"revealDuration",
    		"breakpoint",
    		"revealed",
    		"disableHighlight",
    		"showCompleteMessage",
    		"showConfetti",
    		"showKeyboard",
    		"keyboardStyle"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Crossword> was created with unknown prop '${key}'`);
    	});

    	function clues_1_focusedCellIndex_binding(value) {
    		focusedCellIndex = value;
    		$$invalidate(8, focusedCellIndex);
    	}

    	function clues_1_focusedCell_binding(value) {
    		focusedCell = value;
    		(($$invalidate(15, focusedCell), $$invalidate(14, cells)), $$invalidate(8, focusedCellIndex));
    	}

    	function clues_1_focusedDirection_binding(value) {
    		focusedDirection = value;
    		$$invalidate(7, focusedDirection);
    	}

    	function puzzle_cells_binding(value) {
    		cells = value;
    		$$invalidate(14, cells);
    	}

    	function puzzle_focusedCellIndex_binding(value) {
    		focusedCellIndex = value;
    		$$invalidate(8, focusedCellIndex);
    	}

    	function puzzle_focusedDirection_binding(value) {
    		focusedDirection = value;
    		$$invalidate(7, focusedDirection);
    	}

    	function article_elementresize_handler() {
    		width = this.offsetWidth;
    		$$invalidate(6, width);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(26, data = $$props.data);
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    		if ("theme" in $$props) $$invalidate(27, theme = $$props.theme);
    		if ("revealDuration" in $$props) $$invalidate(1, revealDuration = $$props.revealDuration);
    		if ("breakpoint" in $$props) $$invalidate(28, breakpoint = $$props.breakpoint);
    		if ("revealed" in $$props) $$invalidate(25, revealed = $$props.revealed);
    		if ("disableHighlight" in $$props) $$invalidate(29, disableHighlight = $$props.disableHighlight);
    		if ("showCompleteMessage" in $$props) $$invalidate(2, showCompleteMessage = $$props.showCompleteMessage);
    		if ("showConfetti" in $$props) $$invalidate(3, showConfetti = $$props.showConfetti);
    		if ("showKeyboard" in $$props) $$invalidate(4, showKeyboard = $$props.showKeyboard);
    		if ("keyboardStyle" in $$props) $$invalidate(5, keyboardStyle = $$props.keyboardStyle);
    		if ("$$scope" in $$props) $$invalidate(38, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Toolbar,
    		Puzzle,
    		Clues,
    		CompletedMessage,
    		createClues,
    		createCells,
    		validateClues,
    		fromPairs,
    		themeStyles: themes,
    		data,
    		actions,
    		theme,
    		revealDuration,
    		breakpoint,
    		revealed,
    		disableHighlight,
    		showCompleteMessage,
    		showConfetti,
    		showKeyboard,
    		keyboardStyle,
    		width,
    		focusedDirection,
    		focusedCellIndex,
    		isRevealing,
    		isLoaded,
    		isChecking,
    		revealTimeout,
    		clueCompletion,
    		originalClues,
    		validated,
    		clues,
    		cells,
    		onDataUpdate,
    		checkClues,
    		reset,
    		onClear,
    		onReveal,
    		onCheck,
    		startReveal,
    		onToolbarEvent,
    		focusedCell,
    		cellIndexMap,
    		percentCorrect,
    		isComplete,
    		isDisableHighlight,
    		stacked,
    		inlineStyles
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(26, data = $$props.data);
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    		if ("theme" in $$props) $$invalidate(27, theme = $$props.theme);
    		if ("revealDuration" in $$props) $$invalidate(1, revealDuration = $$props.revealDuration);
    		if ("breakpoint" in $$props) $$invalidate(28, breakpoint = $$props.breakpoint);
    		if ("revealed" in $$props) $$invalidate(25, revealed = $$props.revealed);
    		if ("disableHighlight" in $$props) $$invalidate(29, disableHighlight = $$props.disableHighlight);
    		if ("showCompleteMessage" in $$props) $$invalidate(2, showCompleteMessage = $$props.showCompleteMessage);
    		if ("showConfetti" in $$props) $$invalidate(3, showConfetti = $$props.showConfetti);
    		if ("showKeyboard" in $$props) $$invalidate(4, showKeyboard = $$props.showKeyboard);
    		if ("keyboardStyle" in $$props) $$invalidate(5, keyboardStyle = $$props.keyboardStyle);
    		if ("width" in $$props) $$invalidate(6, width = $$props.width);
    		if ("focusedDirection" in $$props) $$invalidate(7, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(8, focusedCellIndex = $$props.focusedCellIndex);
    		if ("isRevealing" in $$props) $$invalidate(9, isRevealing = $$props.isRevealing);
    		if ("isLoaded" in $$props) $$invalidate(10, isLoaded = $$props.isLoaded);
    		if ("isChecking" in $$props) $$invalidate(11, isChecking = $$props.isChecking);
    		if ("revealTimeout" in $$props) revealTimeout = $$props.revealTimeout;
    		if ("clueCompletion" in $$props) clueCompletion = $$props.clueCompletion;
    		if ("originalClues" in $$props) originalClues = $$props.originalClues;
    		if ("validated" in $$props) $$invalidate(12, validated = $$props.validated);
    		if ("clues" in $$props) $$invalidate(13, clues = $$props.clues);
    		if ("cells" in $$props) $$invalidate(14, cells = $$props.cells);
    		if ("focusedCell" in $$props) $$invalidate(15, focusedCell = $$props.focusedCell);
    		if ("cellIndexMap" in $$props) $$invalidate(16, cellIndexMap = $$props.cellIndexMap);
    		if ("percentCorrect" in $$props) $$invalidate(41, percentCorrect = $$props.percentCorrect);
    		if ("isComplete" in $$props) $$invalidate(17, isComplete = $$props.isComplete);
    		if ("isDisableHighlight" in $$props) $$invalidate(18, isDisableHighlight = $$props.isDisableHighlight);
    		if ("stacked" in $$props) $$invalidate(19, stacked = $$props.stacked);
    		if ("inlineStyles" in $$props) $$invalidate(20, inlineStyles = $$props.inlineStyles);
    	};

    	let focusedCell;
    	let cellIndexMap;
    	let percentCorrect;
    	let isComplete;
    	let isDisableHighlight;
    	let stacked;
    	let inlineStyles;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*data*/ 67108864) {
    			 (onDataUpdate());
    		}

    		if ($$self.$$.dirty[0] & /*cells, focusedCellIndex*/ 16640) {
    			 $$invalidate(15, focusedCell = cells[focusedCellIndex] || {});
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 16384) {
    			 $$invalidate(16, cellIndexMap = fromPairs(cells.map(cell => [cell.id, cell.index])));
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 16384) {
    			 $$invalidate(41, percentCorrect = cells.filter(d => d.answer === d.value).length / cells.length);
    		}

    		if ($$self.$$.dirty[1] & /*percentCorrect*/ 1024) {
    			 $$invalidate(17, isComplete = percentCorrect == 1);
    		}

    		if ($$self.$$.dirty[0] & /*isComplete, disableHighlight*/ 537001984) {
    			 $$invalidate(18, isDisableHighlight = isComplete && disableHighlight);
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 16384) {
    			 ($$invalidate(13, clues = checkClues()));
    		}

    		if ($$self.$$.dirty[0] & /*cells, clues*/ 24576) {
    			 ($$invalidate(25, revealed = !clues.filter(d => !d.isCorrect).length));
    		}

    		if ($$self.$$.dirty[0] & /*width, breakpoint*/ 268435520) {
    			 $$invalidate(19, stacked = width < breakpoint);
    		}

    		if ($$self.$$.dirty[0] & /*theme*/ 134217728) {
    			 $$invalidate(20, inlineStyles = themes[theme]);
    		}
    	};

    	return [
    		actions,
    		revealDuration,
    		showCompleteMessage,
    		showConfetti,
    		showKeyboard,
    		keyboardStyle,
    		width,
    		focusedDirection,
    		focusedCellIndex,
    		isRevealing,
    		isLoaded,
    		isChecking,
    		validated,
    		clues,
    		cells,
    		focusedCell,
    		cellIndexMap,
    		isComplete,
    		isDisableHighlight,
    		stacked,
    		inlineStyles,
    		onClear,
    		onReveal,
    		onCheck,
    		onToolbarEvent,
    		revealed,
    		data,
    		theme,
    		breakpoint,
    		disableHighlight,
    		slots,
    		clues_1_focusedCellIndex_binding,
    		clues_1_focusedCell_binding,
    		clues_1_focusedDirection_binding,
    		puzzle_cells_binding,
    		puzzle_focusedCellIndex_binding,
    		puzzle_focusedDirection_binding,
    		article_elementresize_handler,
    		$$scope
    	];
    }

    class Crossword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				data: 26,
    				actions: 0,
    				theme: 27,
    				revealDuration: 1,
    				breakpoint: 28,
    				revealed: 25,
    				disableHighlight: 29,
    				showCompleteMessage: 2,
    				showConfetti: 3,
    				showKeyboard: 4,
    				keyboardStyle: 5
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Crossword",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showKeyboard*/ ctx[4] === undefined && !("showKeyboard" in props)) {
    			console.warn("<Crossword> was created without expected prop 'showKeyboard'");
    		}
    	}

    	get data() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actions() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actions(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get revealDuration() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set revealDuration(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get breakpoint() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set breakpoint(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get revealed() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set revealed(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableHighlight() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableHighlight(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showCompleteMessage() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showCompleteMessage(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showConfetti() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showConfetti(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showKeyboard() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showKeyboard(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keyboardStyle() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keyboardStyle(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var dataNYTMini = [
    	{
    		clue: "The 1% of 1% milk",
    		answer: "FAT",
    		direction: "across",
    		x: 2,
    		y: 0
    	},
    	{
    		clue: "Flicker of light",
    		answer: "GLINT",
    		direction: "across",
    		x: 0,
    		y: 1
    	},
    	{
    		clue: "Really neat",
    		answer: "NIFTY",
    		direction: "across",
    		x: 0,
    		y: 2
    	},
    	{
    		clue: "\"__ we meet again\"",
    		answer: "UNTIL",
    		direction: "across",
    		x: 0,
    		y: 3
    	},
    	{
    		clue: "It's way over your head",
    		answer: "SKY",
    		direction: "across",
    		x: 0,
    		y: 4
    	},
    	{
    		clue: "Point bonus for using all seven tiles in Scrabble",
    		answer: "FIFTY",
    		direction: "down",
    		x: 2,
    		y: 0
    	},
    	{
    		clue: "Opposite of pro-",
    		answer: "ANTI",
    		direction: "down",
    		x: 3,
    		y: 0
    	},
    	{
    		clue: "Texter's \"gotta run\"",
    		answer: "TTYL",
    		direction: "down",
    		x: 4,
    		y: 0
    	},
    	{
    		clue: "Migratory antelopes",
    		answer: "GNUS",
    		direction: "down",
    		x: 0,
    		y: 1
    	},
    	{
    		clue: "Clickable part of a webpage",
    		answer: "LINK",
    		direction: "down",
    		x: 1,
    		y: 1
    	}
    ];

    var customCword = [
    	{
    		clue: "underwear but no top for social workers ? (4)",
    		answer: "ANTS",
    		direction: "across",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "the old man, a holy person in history (4)",
    		answer: "PAST",
    		direction: "across",
    		x: 5,
    		y: 0
    	},
    	{
    		clue: "king drowned in northbound river shoot (5)",
    		answer: "SKEET",
    		direction: "across",
    		x: 10,
    		y: 0
    	},
    	{
    		clue: "family doctor covering doughnuts with sticky stuff (4)",
    		answer: "GOOP",
    		direction: "across",
    		x: 0,
    		y: 1
    	},
    	{
    		clue: "jelly in a dish, indian formula served up (4)",
    		answer: "AGAR",
    		direction: "across",
    		x: 5,
    		y: 1
    	},
    	{
    		clue: "noble, with great success, recited poetic lines (5)",
    		answer: "HAIKU",
    		direction: "across",
    		x: 10,
    		y: 1
    	},
    	{
    		clue: "feasting consuming wine (4)",
    		answer: "ASTI",
    		direction: "across",
    		x: 0,
    		y: 2
    	},
    	{
    		clue: "angry fly is heard (4)",
    		answer: "SORE",
    		direction: "across",
    		x: 5,
    		y: 2
    	},
    	{
    		clue: "the last few pages of a book maybe penned by colin dexter (5)",
    		answer: "INDEX",
    		direction: "across",
    		x: 10,
    		y: 2
    	},
    	{
    		clue: "following travolta's lead, hanks and diesel breaking booking date in the fall (12)",
    		answer: "THANKSGIVING",
    		direction: "across",
    		x: 0,
    		y: 3
    	},
    	{
    		clue: "woman who was beautiful, ace, capital! (6)",
    		answer: "HELENA",
    		direction: "across",
    		x: 0,
    		y: 4
    	},
    	{
    		clue: "forms a mental image of sea and tide turning (7)",
    		answer: "IDEATES",
    		direction: "across",
    		x: 8,
    		y: 4
    	},
    	{
    		clue: "twit causes missing cue (not altogether) (3)",
    		answer: "ASS",
    		direction: "across",
    		x: 0,
    		y: 5
    	},
    	{
    		clue: "declines to lie about bishop close to actress (4)",
    		answer: "EBBS",
    		direction: "across",
    		x: 4,
    		y: 5
    	},
    	{
    		clue: "wash carrot, removing both ends, and look at me (6)",
    		answer: "ARROYO",
    		direction: "across",
    		x: 9,
    		y: 5
    	},
    	{
    		clue: "look in study for stock again (6)",
    		answer: "RELOAD",
    		direction: "across",
    		x: 3,
    		y: 6
    	},
    	{
    		clue: "minerals located in the heart of arden, say (4)",
    		answer: "ORES",
    		direction: "across",
    		x: 11,
    		y: 6
    	},
    	{
    		clue: "role with cabinet reshuffles in party (11)",
    		answer: "CELEBRATION",
    		direction: "across",
    		x: 2,
    		y: 7
    	},
    	{
    		clue: "this old deity makes sound of deer (4)",
    		answer: "FAUN",
    		direction: "across",
    		x: 0,
    		y: 8
    	},
    	{
    		clue: "rinses off emergency signals (6)",
    		answer: "SIRENS",
    		direction: "across",
    		x: 6,
    		y: 8
    	},
    	{
    		clue: "\"yes, captain,\" i repeatedly said (3-3)",
    		answer: "AYEAYE",
    		direction: "across",
    		x: 0,
    		y: 9
    	},
    	{
    		clue: "great waves from 22, we hear (4)",
    		answer: "SEAS",
    		direction: "across",
    		x: 7,
    		y: 9
    	},
    	{
    		clue: "i shall and will show hostility (3-4)",
    		answer: "ILL",
    		direction: "across",
    		x: 12,
    		y: 9
    	},
    	{
    		clue: "more chaotic when eggs, principally in m&s rise inordinately (7)",
    		answer: "MESSIER",
    		direction: "across",
    		x: 0,
    		y: 10
    	},
    	{
    		clue: "map area poorly erased (3,3)",
    		answer: "REDSEA",
    		direction: "across",
    		x: 9,
    		y: 10
    	},
    	{
    		clue: "cooked a nice lobster for special occasions (12)",
    		answer: "CELEBRATIONS",
    		direction: "across",
    		x: 3,
    		y: 11
    	},
    	{
    		clue: "city found west of lima (5)",
    		answer: "BASEL",
    		direction: "across",
    		x: 0,
    		y: 12
    	},
    	{
    		clue: "catcall from writer that hurt! (4)",
    		answer: "MEOW",
    		direction: "across",
    		x: 6,
    		y: 12
    	},
    	{
    		clue: "ot character captured by grandma moses (4)",
    		answer: "AMOS",
    		direction: "across",
    		x: 11,
    		y: 12
    	},
    	{
    		clue: "fix yours truly, with bandages (5)",
    		answer: "AMEND",
    		direction: "across",
    		x: 0,
    		y: 13
    	},
    	{
    		clue: "female entertained by jovial males (4)",
    		answer: "ALMA",
    		direction: "across",
    		x: 6,
    		y: 13
    	},
    	{
    		clue: "somewhat insane roman? (4)",
    		answer: "NERO",
    		direction: "across",
    		x: 11,
    		y: 13
    	},
    	{
    		clue: "starts to decrease intake, eventually turning slimmer (5)",
    		answer: "DIETS",
    		direction: "across",
    		x: 0,
    		y: 14
    	},
    	{
    		clue: "3",
    		answer: "PLAY",
    		direction: "across",
    		x: 6,
    		y: 14
    	},
    	{
    		clue: "greek god is concerned with shaved head (4)",
    		answer: "ARES",
    		direction: "across",
    		x: 11,
    		y: 14
    	},
    	{
    		clue: "she gives expression of surprise about label being back to front (6)",
    		answer: "AGATHA",
    		direction: "down",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "lunches just for men (6)",
    		answer: "NOSHES",
    		direction: "down",
    		x: 1,
    		y: 0
    	},
    	{
    		clue: "young child, also cut, comes to (6)",
    		answer: "TOTALS",
    		direction: "down",
    		x: 2,
    		y: 0
    	},
    	{
    		clue: "second long part of hardback? (5)",
    		answer: "SPINE",
    		direction: "down",
    		x: 3,
    		y: 0
    	},
    	{
    		clue: "good enough, as port proved to be after dinner (8)",
    		answer: "PASSABLE",
    		direction: "down",
    		x: 5,
    		y: 0
    	},
    	{
    		clue: "leaders in amateur game of golf eagerly excited (4)",
    		answer: "AGOG",
    		direction: "down",
    		x: 6,
    		y: 0
    	},
    	{
    		clue: "hitches a ride, revealing dress (4)",
    		answer: "SARI",
    		direction: "down",
    		x: 7,
    		y: 0
    	},
    	{
    		clue: "la source de notre vie (5)",
    		answer: "TREVI",
    		direction: "down",
    		x: 8,
    		y: 0
    	},
    	{
    		clue: "star maybe getting a black eye (6)",
    		answer: "SHINER",
    		direction: "down",
    		x: 10,
    		y: 0
    	},
    	{
    		clue: "rage and regrets apparently after a thousand jumpers (9)",
    		answer: "KANGAROOS",
    		direction: "down",
    		x: 11,
    		y: 0
    	},
    	{
    		clue: "eastern identity conveyed in religious festival (3)",
    		answer: "EID",
    		direction: "down",
    		x: 12,
    		y: 0
    	},
    	{
    		clue: "subsist on contents of single kettle (3)",
    		answer: "EKE",
    		direction: "down",
    		x: 13,
    		y: 0
    	},
    	{
    		clue: "reportedly puts pleats in formal dress (3)",
    		answer: "TUX",
    		direction: "down",
    		x: 14,
    		y: 0
    	},
    	{
    		clue: "prepare for dubbing young on the radio (5)",
    		answer: "KNEEL",
    		direction: "down",
    		x: 4,
    		y: 3
    	},
    	{
    		clue: "a challenge for cretan climbers, they say, getting down from it? (3)",
    		answer: "IDA",
    		direction: "down",
    		x: 9,
    		y: 3
    	},
    	{
    		clue: "removed forcibly by wind, without further ado (4)",
    		answer: "TORN",
    		direction: "down",
    		x: 12,
    		y: 4
    	},
    	{
    		clue: "something that exposes the pupil to an enlightening experience? (3-6)",
    		answer: "EYE",
    		direction: "down",
    		x: 13,
    		y: 4
    	},
    	{
    		clue: "emergency call centres in crusade for costs (3)",
    		answer: "SOS",
    		direction: "down",
    		x: 14,
    		y: 4
    	},
    	{
    		clue: "ducks often seen going after bits, getting odds and ends? (4)",
    		answer: "BOBS",
    		direction: "down",
    		x: 6,
    		y: 5
    	},
    	{
    		clue: "they offer a wraparound service in india (5)",
    		answer: "SARIS",
    		direction: "down",
    		x: 7,
    		y: 5
    	},
    	{
    		clue: "name a saint in modern setting becoming popular again (9)",
    		answer: "RENASCENT",
    		direction: "down",
    		x: 3,
    		y: 6
    	},
    	{
    		clue: "two daughters are inside with wicked reckless type (4-5)",
    		answer: "DARE",
    		direction: "down",
    		x: 8,
    		y: 6
    	},
    	{
    		clue: "signals last of sugar to be removed from preserves (4)",
    		answer: "CUES",
    		direction: "down",
    		x: 2,
    		y: 7
    	},
    	{
    		clue: "impetuous dean, discovered nude entering scottish river (8)",
    		answer: "TEARAWAY",
    		direction: "down",
    		x: 9,
    		y: 7
    	},
    	{
    		clue: "part of magazine hidden in main settee (5)",
    		answer: "INSET",
    		direction: "down",
    		x: 10,
    		y: 7
    	},
    	{
    		clue: "loud american male relatives (3)",
    		answer: "FAM",
    		direction: "down",
    		x: 0,
    		y: 8
    	},
    	{
    		clue: "\"yes, captain,\" i said (3)",
    		answer: "AYE",
    		direction: "down",
    		x: 1,
    		y: 8
    	},
    	{
    		clue: "year with disastrous slide in outputs (6)",
    		answer: "YIELDS",
    		direction: "down",
    		x: 4,
    		y: 9
    	},
    	{
    		clue: "one notably slippery slope, but not hard (3)",
    		answer: "EEL",
    		direction: "down",
    		x: 5,
    		y: 9
    	},
    	{
    		clue: "compound is linked to the fall of rome (6)",
    		answer: "ISOMER",
    		direction: "down",
    		x: 12,
    		y: 9
    	},
    	{
    		clue: "former tv host regarding poetry's \"radiant maiden\" (6)",
    		answer: "LENORE",
    		direction: "down",
    		x: 13,
    		y: 9
    	},
    	{
    		clue: "catches girls dropping sweetheart for love (6)",
    		answer: "LASSOS",
    		direction: "down",
    		x: 14,
    		y: 9
    	},
    	{
    		clue: "originally model, then draw over (5)",
    		answer: "REMAP",
    		direction: "down",
    		x: 6,
    		y: 10
    	},
    	{
    		clue: "woman getting an a with papers returned (5)",
    		answer: "DIANA",
    		direction: "down",
    		x: 11,
    		y: 10
    	},
    	{
    		clue: "pen name adopted by a. currer b. ellis c. acton (4)",
    		answer: "BELL",
    		direction: "down",
    		x: 7,
    		y: 11
    	},
    	{
    		clue: "pervasive smell behind the first kind of tomato (4)",
    		answer: "ROMA",
    		direction: "down",
    		x: 8,
    		y: 11
    	},
    	{
    		clue: "black pants modified (3-8)",
    		answer: "BAD",
    		direction: "down",
    		x: 0,
    		y: 12
    	},
    	{
    		clue: "a michigan buddy (3)",
    		answer: "AMI",
    		direction: "down",
    		x: 1,
    		y: 12
    	},
    	{
    		clue: "meet in city (3)",
    		answer: "SEE",
    		direction: "down",
    		x: 2,
    		y: 12
    	}
    ];

    var dataNYTDaily = [
    	{
    		clue: "a",
    		answer: "BEEF",
    		direction: "across",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "What many people have for public speaking",
    		answer: "PHOBIA",
    		direction: "across",
    		x: 5,
    		y: 0
    	},
    	{
    		clue: "\"We ___ loudest when we ___ to ourselves\": Eric Hoffer",
    		answer: "LIE",
    		direction: "across",
    		x: 12,
    		y: 0
    	},
    	{
    		clue: "Taj Mahal city",
    		answer: "AGRA",
    		direction: "across",
    		x: 0,
    		y: 1
    	},
    	{
    		clue: "College in Manhattan",
    		answer: "BARUCH",
    		direction: "across",
    		x: 5,
    		y: 1
    	},
    	{
    		clue: "Halloween time: Abbr.",
    		answer: "OCT",
    		direction: "across",
    		x: 12,
    		y: 1
    	},
    	{
    		clue: "Ways to cross a river in Switzerland?",
    		answer: "BERNBRIDGES",
    		direction: "across",
    		x: 0,
    		y: 2
    	},
    	{
    		clue: "Big expense for some city dwellers",
    		answer: "CAR",
    		direction: "across",
    		x: 12,
    		y: 2
    	},
    	{
    		clue: "Old Glory's land, for short",
    		answer: "USOFA",
    		direction: "across",
    		x: 0,
    		y: 3
    	},
    	{
    		clue: "Funny Brooks",
    		answer: "MEL",
    		direction: "across",
    		x: 6,
    		y: 3
    	},
    	{
    		clue: "Prop for Mr. Peanut",
    		answer: "CANE",
    		direction: "across",
    		x: 11,
    		y: 3
    	},
    	{
    		clue: "Crow, e.g.",
    		answer: "TRIBE",
    		direction: "across",
    		x: 1,
    		y: 4
    	},
    	{
    		clue: "Fixed a mistake at a card table",
    		answer: "REDEALT",
    		direction: "across",
    		x: 7,
    		y: 4
    	},
    	{
    		clue: "First showing at a film festival in France?",
    		answer: "CANNESOPENER",
    		direction: "across",
    		x: 3,
    		y: 5
    	},
    	{
    		clue: "Co. that merged into Verizon",
    		answer: "GTE",
    		direction: "across",
    		x: 0,
    		y: 6
    	},
    	{
    		clue: "Owned",
    		answer: "HAD",
    		direction: "across",
    		x: 5,
    		y: 6
    	},
    	{
    		clue: "___ Conventions",
    		answer: "GENEVA",
    		direction: "across",
    		x: 9,
    		y: 6
    	},
    	{
    		clue: "Supercharge, as an engine",
    		answer: "REV",
    		direction: "across",
    		x: 0,
    		y: 7
    	},
    	{
    		clue: "Lightly touch, as with a handkerchief",
    		answer: "DAB",
    		direction: "across",
    		x: 4,
    		y: 7
    	},
    	{
    		clue: "Wyoming-to-Missouri dir.",
    		answer: "ESE",
    		direction: "across",
    		x: 8,
    		y: 7
    	},
    	{
    		clue: "Chinese dynasty circa A.D. 250",
    		answer: "WEI",
    		direction: "across",
    		x: 12,
    		y: 7
    	},
    	{
    		clue: "Actress Brie of \"Mad Men\"",
    		answer: "ALISON",
    		direction: "across",
    		x: 0,
    		y: 8
    	},
    	{
    		clue: "Colorful fish",
    		answer: "KOI",
    		direction: "across",
    		x: 7,
    		y: 8
    	},
    	{
    		clue: "Creator of sketches, in brief",
    		answer: "SNL",
    		direction: "across",
    		x: 12,
    		y: 8
    	},
    	{
    		clue: "Census taker in India?",
    		answer: "DELHICOUNTER",
    		direction: "across",
    		x: 0,
    		y: 9
    	},
    	{
    		clue: "Like Barack Obama's presidency",
    		answer: "TWOTERM",
    		direction: "across",
    		x: 1,
    		y: 10
    	},
    	{
    		clue: "Loads",
    		answer: "SLEWS",
    		direction: "across",
    		x: 9,
    		y: 10
    	},
    	{
    		clue: "Denny's competitor",
    		answer: "IHOP",
    		direction: "across",
    		x: 0,
    		y: 11
    	},
    	{
    		clue: "Mensa stats",
    		answer: "IQS",
    		direction: "across",
    		x: 6,
    		y: 11
    	},
    	{
    		clue: "Urban sitting spot",
    		answer: "STOOP",
    		direction: "across",
    		x: 10,
    		y: 11
    	},
    	{
    		clue: "Classic tattoo word",
    		answer: "MOM",
    		direction: "across",
    		x: 0,
    		y: 12
    	},
    	{
    		clue: "Police dragnet in South Korea?",
    		answer: "SEOULSEARCH",
    		direction: "across",
    		x: 4,
    		y: 12
    	},
    	{
    		clue: "Spanish article",
    		answer: "UNA",
    		direction: "across",
    		x: 0,
    		y: 13
    	},
    	{
    		clue: "How café may be served",
    		answer: "AULAIT",
    		direction: "across",
    		x: 4,
    		y: 13
    	},
    	{
    		clue: "\"If you're asking me,\" in textspeak",
    		answer: "IMHO",
    		direction: "across",
    		x: 11,
    		y: 13
    	},
    	{
    		clue: "W-2 fig.",
    		answer: "SSN",
    		direction: "across",
    		x: 0,
    		y: 14
    	},
    	{
    		clue: "Fairly",
    		answer: "PRETTY",
    		direction: "across",
    		x: 4,
    		y: 14
    	},
    	{
    		clue: "\"___ Eyes\" (1975 Eagles hit)",
    		answer: "LYIN",
    		direction: "across",
    		x: 11,
    		y: 14
    	},
    	{
    		clue: "Hindu title of respect",
    		answer: "BABU",
    		direction: "down",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "Expel",
    		answer: "EGEST",
    		direction: "down",
    		x: 1,
    		y: 0
    	},
    	{
    		clue: "Misspeaking, e.g.",
    		answer: "ERROR",
    		direction: "down",
    		x: 2,
    		y: 0
    	},
    	{
    		clue: "Some derivative stories, colloquially",
    		answer: "FANFIC",
    		direction: "down",
    		x: 3,
    		y: 0
    	},
    	{
    		clue: "Brew with hipster cred",
    		answer: "PBR",
    		direction: "down",
    		x: 5,
    		y: 0
    	},
    	{
    		clue: "American pop-rock band composed of three sisters",
    		answer: "HAIM",
    		direction: "down",
    		x: 6,
    		y: 0
    	},
    	{
    		clue: "Said \"I'll have ...\"",
    		answer: "ORDERED",
    		direction: "down",
    		x: 7,
    		y: 0
    	},
    	{
    		clue: "Cone-shaped corn snacks",
    		answer: "BUGLES",
    		direction: "down",
    		x: 8,
    		y: 0
    	},
    	{
    		clue: "Swelling reducer",
    		answer: "ICE",
    		direction: "down",
    		x: 9,
    		y: 0
    	},
    	{
    		clue: "Sounds of satisfaction",
    		answer: "AHS",
    		direction: "down",
    		x: 10,
    		y: 0
    	},
    	{
    		clue: "Broadcast often seen at 6:00 p.m. and 11:00 p.m.",
    		answer: "LOCALNEWS",
    		direction: "down",
    		x: 12,
    		y: 0
    	},
    	{
    		clue: "\"That is too much for me\"",
    		answer: "ICANTEVEN",
    		direction: "down",
    		x: 13,
    		y: 0
    	},
    	{
    		clue: "To be: Fr.",
    		answer: "ETRE",
    		direction: "down",
    		x: 14,
    		y: 0
    	},
    	{
    		clue: "Cake with rum",
    		answer: "BABA",
    		direction: "down",
    		x: 4,
    		y: 2
    	},
    	{
    		clue: "Battle of Normandy city",
    		answer: "CAEN",
    		direction: "down",
    		x: 11,
    		y: 3
    	},
    	{
    		clue: "Increase, as resolution",
    		answer: "ENHANCE",
    		direction: "down",
    		x: 5,
    		y: 4
    	},
    	{
    		clue: "Watches Bowser, say",
    		answer: "DOGSITS",
    		direction: "down",
    		x: 9,
    		y: 4
    	},
    	{
    		clue: "Dueling sword",
    		answer: "EPEE",
    		direction: "down",
    		x: 10,
    		y: 4
    	},
    	{
    		clue: "Catch",
    		answer: "NAB",
    		direction: "down",
    		x: 6,
    		y: 5
    	},
    	{
    		clue: "Skate park feature",
    		answer: "RAIL",
    		direction: "down",
    		x: 14,
    		y: 5
    	},
    	{
    		clue: "Many a May or June honoree",
    		answer: "GRAD",
    		direction: "down",
    		x: 0,
    		y: 6
    	},
    	{
    		clue: "Some fund-raisers",
    		answer: "TELETHONS",
    		direction: "down",
    		x: 1,
    		y: 6
    	},
    	{
    		clue: "1975 hit by the Electric Light Orchestra",
    		answer: "EVILWOMAN",
    		direction: "down",
    		x: 2,
    		y: 6
    	},
    	{
    		clue: "\"Just ___\" (Nike slogan)",
    		answer: "DOIT",
    		direction: "down",
    		x: 4,
    		y: 7
    	},
    	{
    		clue: "Very long time",
    		answer: "EON",
    		direction: "down",
    		x: 8,
    		y: 7
    	},
    	{
    		clue: "Union workplace",
    		answer: "SHOP",
    		direction: "down",
    		x: 3,
    		y: 8
    	},
    	{
    		clue: "Small citrus fruit",
    		answer: "KUMQUAT",
    		direction: "down",
    		x: 7,
    		y: 8
    	},
    	{
    		clue: "Baltimore athlete",
    		answer: "ORIOLE",
    		direction: "down",
    		x: 6,
    		y: 9
    	},
    	{
    		clue: "If-___ (computer programming statement)",
    		answer: "ELSE",
    		direction: "down",
    		x: 10,
    		y: 9
    	},
    	{
    		clue: "Wholesale's opposite",
    		answer: "RETAIL",
    		direction: "down",
    		x: 11,
    		y: 9
    	},
    	{
    		clue: "Like a bad apple",
    		answer: "WORMY",
    		direction: "down",
    		x: 12,
    		y: 10
    	},
    	{
    		clue: "2014 Winter Olympics locale",
    		answer: "SOCHI",
    		direction: "down",
    		x: 13,
    		y: 10
    	},
    	{
    		clue: "\"___ in the Morning\" (bygone radio show)",
    		answer: "IMUS",
    		direction: "down",
    		x: 0,
    		y: 11
    	},
    	{
    		clue: "Narrow opening",
    		answer: "SLIT",
    		direction: "down",
    		x: 8,
    		y: 11
    	},
    	{
    		clue: "Sound: Prefix",
    		answer: "PHON",
    		direction: "down",
    		x: 14,
    		y: 11
    	},
    	{
    		clue: "Gradually weaken",
    		answer: "SAP",
    		direction: "down",
    		x: 4,
    		y: 12
    	},
    	{
    		clue: "Home of most of the members of NATO: Abbr.",
    		answer: "EUR",
    		direction: "down",
    		x: 5,
    		y: 12
    	},
    	{
    		clue: "Total mess",
    		answer: "STY",
    		direction: "down",
    		x: 9,
    		y: 12
    	}
    ];

    var dataOreo = [
    	{
    		clue: "Black-and-white cookie",
    		answer: "OREO",
    		direction: "down",
    		x: 0,
    		y: 0
    	},
    	{
    		clue: "Popular cookie",
    		answer: "OREO",
    		direction: "down",
    		x: 3,
    		y: 0
    	},
    	{
    		clue: "Creme-filled cookie",
    		answer: "OREO",
    		direction: "across",
    		x: 0,
    		y: 3
    	},
    	{
    		clue: "Sandwich cookie",
    		answer: "OREO",
    		direction: "across",
    		x: 0,
    		y: 0
    	}
    ];

    /* App.svelte generated by Svelte v3.29.0 */
    const file$b = "App.svelte";

    function create_fragment$b(ctx) {
    	let header;
    	let div1;
    	let form;
    	let div0;
    	let input;
    	let t0;
    	let article;
    	let div2;
    	let h1;
    	let t1;
    	let t2;
    	let p;
    	let t3;
    	let t4;
    	let section;
    	let crossword;
    	let current;

    	crossword = new Crossword({
    			props: { data: customCword },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			form = element("form");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			article = element("article");
    			div2 = element("div");
    			h1 = element("h1");
    			t1 = text("Crossy");
    			t2 = space();
    			p = element("p");
    			t3 = text("An ML-powered crossword generator!\n      Made by Zachary Eichenberger, Haley Johnson, Zachary Goldston");
    			t4 = space();
    			section = element("section");
    			create_component(crossword.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div1 = claim_element(header_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			form = claim_element(div1_nodes, "FORM", { id: true, action: true, method: true });
    			var form_nodes = children(form);
    			div0 = claim_element(form_nodes, "DIV", {});
    			var div0_nodes = children(div0);

    			input = claim_element(div0_nodes, "INPUT", {
    				id: true,
    				type: true,
    				name: true,
    				placeholder: true,
    				list: true,
    				autocomplete: true,
    				class: true
    			});

    			div0_nodes.forEach(detach_dev);
    			form_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t0 = claim_space(header_nodes);
    			header_nodes.forEach(detach_dev);
    			article = claim_element(nodes, "ARTICLE", { class: true });
    			var article_nodes = children(article);
    			div2 = claim_element(article_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			h1 = claim_element(div2_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t1 = claim_text(h1_nodes, "Crossy");
    			h1_nodes.forEach(detach_dev);
    			t2 = claim_space(div2_nodes);
    			p = claim_element(div2_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t3 = claim_text(p_nodes, "An ML-powered crossword generator!\n      Made by Zachary Eichenberger, Haley Johnson, Zachary Goldston");
    			p_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t4 = claim_space(article_nodes);
    			section = claim_element(article_nodes, "SECTION", { id: true, class: true });
    			var section_nodes = children(section);
    			claim_component(crossword.$$.fragment, section_nodes);
    			section_nodes.forEach(detach_dev);
    			article_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(input, "id", "search");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "search");
    			attr_dev(input, "placeholder", "Insert your crossword theme .");
    			attr_dev(input, "list", "search-suggestions");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "class", "svelte-1qtqxan");
    			add_location(input, file$b, 6, 8, 133);
    			add_location(div0, file$b, 5, 6, 119);
    			attr_dev(form, "id", "myForm");
    			attr_dev(form, "action", "http://127.0.0.1:8000/create");
    			attr_dev(form, "method", "POST");
    			add_location(form, file$b, 4, 4, 42);
    			attr_dev(div1, "class", "search-bar svelte-1qtqxan");
    			add_location(div1, file$b, 3, 2, 13);
    			attr_dev(header, "class", "svelte-1qtqxan");
    			add_location(header, file$b, 2, 0, 2);
    			attr_dev(h1, "class", "svelte-1qtqxan");
    			add_location(h1, file$b, 21, 4, 480);
    			attr_dev(p, "class", "svelte-1qtqxan");
    			add_location(p, file$b, 22, 4, 500);
    			attr_dev(div2, "class", "intro svelte-1qtqxan");
    			add_location(div2, file$b, 20, 2, 456);
    			attr_dev(section, "id", "Your Custom Puzzle ");
    			attr_dev(section, "class", "svelte-1qtqxan");
    			add_location(section, file$b, 28, 2, 634);
    			attr_dev(article, "class", "svelte-1qtqxan");
    			add_location(article, file$b, 18, 9, 443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, form);
    			append_dev(form, div0);
    			append_dev(div0, input);
    			append_dev(header, t0);
    			insert_dev(target, article, anchor);
    			append_dev(article, div2);
    			append_dev(div2, h1);
    			append_dev(h1, t1);
    			append_dev(div2, t2);
    			append_dev(div2, p);
    			append_dev(p, t3);
    			append_dev(article, t4);
    			append_dev(article, section);
    			mount_component(crossword, section, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crossword.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crossword.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(article);
    			destroy_component(crossword);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let revealedUSA;
    	let theme;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Crossword,
    		dataNYTMini,
    		customCword,
    		dataNYTDaily,
    		dataOreo,
    		revealedUSA,
    		theme
    	});

    	$$self.$inject_state = $$props => {
    		if ("revealedUSA" in $$props) revealedUSA = $$props.revealedUSA;
    		if ("theme" in $$props) theme = $$props.theme;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const app = new App({
    	target: document.querySelector("main"),
    	hydrate: true
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
