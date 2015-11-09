module todo {
    export var AppViewDefinition = {
        content: '		<section id="todoapp">',
    '<header id="header">',
    <h1>todos</h1>
    <input id="new-todo" placeholder="What needs to be done?" autofocus>
</header>
<section id="main">
<input id="toggle-all" type="checkbox">
    <label for="toggle-all">Mark all as complete</label>
<ul id="todo-list"></ul>
</section>
<footer id="footer">
<span id="todo-count"></span>
<ul id="filters">
<li>
    <a href="#/" class="selected">All</a>
</li>
<li>
    <a href="#/active">Active</a>
</li>
<li>
    <a href="#/completed">Completed</a>
</li>
</ul>
<button id="clear-completed">Clear completed</button>
</footer>
</section>'
    }
}