$(document).ready(function () {
    var pObj = JSON.parse(pModel);
    $('#pagination').twbsPagination({
        totalPages: pObj.totalPages,
        visiblePages: 10,
        startPage: pObj.page,
        onPageClick: function (event, page) {
            window.location.href = pObj.profilePath + '?page=' + page;
        }
    });
});