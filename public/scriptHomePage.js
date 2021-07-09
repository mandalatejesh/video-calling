function joinRoom() {
  let id = document.getElementById("roomId").value;
  let name = document.getElementById("user-name").value;
  if (name == "") {
    name = "anonymous";
  }
  if (id != undefined && id != null) {
    window.location = "/" + id + "?username=" + name;
  }
}
let input = document.getElementById("user-name");

input.addEventListener("keyup", (event) => {
  if (event.key == "Enter") {
    event.preventDefault();
    document.getElementById("btn").click();
  }
});
document.getElementById("create-new-room").addEventListener("click", () => {
  let room = document.getElementById("roomId");
  let id = Math.floor(1000 * Math.random());
  room.value = id;
});
