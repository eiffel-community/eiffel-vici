function hideAllObjects(containers) {
    console.log(containers);
    for (let container in containers) {
        containers[container].hide();
    }
}

function showObject(container) {
    container.show();
}