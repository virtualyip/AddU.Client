
function fetchPostData(type, request, params, callback) {
	var requestParams = {ajaxSource : true};
	if (params != null) {
		$.each( params, function( key, value ) {
			requestParams[key] = value;
		});
	}
	$.post(main_server+type+"/"+request, 
		requestParams, 
		callback, 'json');
};
