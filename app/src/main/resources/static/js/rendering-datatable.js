function renderDatatable(container, datatable, data) {
    let preDefColumns = [
        {
            title: 'Chain',
            data: null,
            defaultContent: '<button class="btn btn-default row-button">Graph</button>'
        }
    ];
    datatable = container.DataTable({
        destroy: true,
        data: data.data,
        columns: preDefColumns.concat(data.columns),
        scrollY: '80vh',
        scrollCollapse: true,
        lengthMenu: [[20, 200, -1], [20, 200, "All"]],
        order: [4, 'asc'],
    });

    container.find('tbody').on('click', 'button', function () {
        let data = datatable.row($(this).parents('tr')).data();
        newEventTarget(data.id);
    });
}