(function () {
  var KEY = "course-wheel-v1";

  // Starting courses (edit these to your own)
  var courses = ["Web Development", "Data Science", "Graphic Design", "Digital Marketing"];

  // Load saved courses from the browser, if any
  try {
    var s = localStorage.getItem(KEY);
    if (s) {
      var p = JSON.parse(s);
      if (Array.isArray(p)) courses = p;
    }
  } catch (e) {}

  var cv = document.getElementById("wheel");
  var ctx = cv.getContext("2d");
  var W = cv.width;
  var R = W / 2 - 8;
  var rot = 0;
  var spinning = false;

  var $ = function (id) { return document.getElementById(id); };

  function color(i, n) {
    return "hsl(" + Math.round(i * 360 / Math.max(n, 1)) + ",65%,45%)";
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(courses)); } catch (e) {}
  }

  // Draw the wheel
  function draw() {
    ctx.clearRect(0, 0, W, W);
    var n = courses.length;

    ctx.save();
    ctx.translate(W / 2, W / 2);

    if (!n) {
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = "#8884a8";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 36px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add a course", 0, 10);
    } else {
      var seg = Math.PI * 2 / n;
      ctx.rotate(rot);

      for (var i = 0; i < n; i++) {
        // Slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, i * seg, (i + 1) * seg);
        ctx.closePath();
        ctx.fillStyle = color(i, n);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,.85)";
        ctx.stroke();

        // Label
        ctx.save();
        ctx.rotate(i * seg + seg / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        var fs = n > 12 ? 22 : n > 8 ? 28 : 34;
        ctx.font = "600 " + fs + "px system-ui,sans-serif";
        var t = courses[i];
        if (t.length > 18) t = t.slice(0, 17) + "…";
        ctx.shadowColor = "rgba(0,0,0,.4)";
        ctx.shadowBlur = 4;
        ctx.fillText(t, R - 28, fs / 3);
        ctx.restore();
      }
    }
    ctx.restore();

    // Center hub
    ctx.beginPath();
    ctx.arc(W / 2, W / 2, 46, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(0,0,0,.15)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, W / 2, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#6c4cf1";
    ctx.fill();
  }

  // Draw the list of courses on the right
  function renderList() {
    var ul = $("list");
    ul.innerHTML = "";

    courses.forEach(function (c, i) {
      var li = document.createElement("li");

      var dot = document.createElement("div");
      dot.className = "dot";
      dot.style.background = color(i, courses.length);

      var label = document.createElement("span");
      label.className = "t";
      label.textContent = c;

      var del = document.createElement("button");
      del.textContent = "×";
      del.title = "Remove";
      del.setAttribute("aria-label", "Remove " + c);
      del.onclick = function () {
        if (spinning) return;
        courses.splice(i, 1);
        update();
      };

      li.appendChild(dot);
      li.appendChild(label);
      li.appendChild(del);
      ul.appendChild(li);
    });

    $("hint").textContent = courses.length < 2
      ? "Add at least 2 courses to spin."
      : courses.length + " courses on the wheel.";
    $("clear").style.display = courses.length ? "" : "none";
  }

  function update() {
    save();
    renderList();
    draw();
  }

  // Add a course
  function add() {
    var v = $("inp").value.trim();
    if (!v || spinning) return;
    courses.push(v);
    $("inp").value = "";
    update();
    $("inp").focus();
  }

  $("addBtn").onclick = add;
  $("inp").addEventListener("keydown", function (e) {
    if (e.key === "Enter") add();
  });

  // Clear all courses
  $("clear").onclick = function () {
    if (spinning) return;
    courses = [];
    $("result").textContent = "Press spin to pick a course.";
    update();
  };

  // Spin the wheel
  $("spin").onclick = function () {
    if (spinning) return;

    var n = courses.length;
    if (n < 2) {
      $("result").textContent = n
        ? "Add at least one more course to spin."
        : "Add some courses first.";
      return;
    }

    spinning = true;
    $("spin").disabled = true;
    $("result").textContent = "Spinning…";

    var start = rot;
    var extra = Math.PI * 2 * (5 + Math.random() * 3) + Math.random() * Math.PI * 2;
    var duration = 4500;
    var t0 = performance.now();

    function step(now) {
      var t = Math.min((now - t0) / duration, 1);
      var ease = 1 - Math.pow(1 - t, 4); // slows down toward the end
      rot = start + extra * ease;
      draw();

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        spinning = false;
        $("spin").disabled = false;

        // Work out which slice is under the pointer (top of the wheel)
        var seg = Math.PI * 2 / n;
        var a = ((-Math.PI / 2 - rot) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        var idx = Math.floor(a / seg) % n;

        $("result").innerHTML = "📖 Your next course to read:<strong></strong>";
        $("result").querySelector("strong").textContent = courses[idx];
      }
    }
    requestAnimationFrame(step);
  };

  update();
})();