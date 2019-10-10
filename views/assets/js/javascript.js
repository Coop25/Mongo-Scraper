function floop(test) {
    console.log(test.getAttribute("mongo-id"));
    test.parentElement.parentElement.remove();
}