function initializeMap() {
    var mapContainer = document.getElementById('map'), // 지도를 표시할 div
        mapOption = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

    var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
    var ps = new kakao.maps.services.Places(); // 장소 검색 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder(); // 주소-좌표 변환 객체를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({ zindex: 1 }); // 인포윈도우를 생성합니다
    var travelPoints = [];
    var markers = [];
    var infoMarker = null; // 법정동 주소정보 마커
    var polyline = null; // 폴리라인 객체

    // 지도 클릭 이벤트 설정
    kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
        searchDetailAddrFromCoords(mouseEvent.latLng, function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var detailAddr = result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
                detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';
                var content = '<div class="bAddr">' +
                    '<span class="title">법정동 주소정보</span>' +
                    detailAddr +
                    '</div>';
                if (infoMarker) {
                    infoMarker.setMap(null);
                }
                infoMarker = new kakao.maps.Marker({
                    position: mouseEvent.latLng,
                    map: map
                });
                infowindow.setContent(content);
                infowindow.open(map, infoMarker);
                kakao.maps.event.addListener(infoMarker, 'click', function () {
                    infowindow.open(map, infoMarker);
                });
            } else {
                alert('주소를 가져오지 못했습니다.');
            }
        });
    });

    // 여행지 추가 함수
    function addTravelPoint(latLng, placeName) {
        console.log(`장소 이름: ${placeName}`);
        for (var i = 0; i < 4; i++) {
            if (!travelPoints[i]) {
                travelPoints[i] = { latLng: latLng, placeName: placeName };

                var marker = new kakao.maps.Marker({
                    position: latLng,
                    map: map,
                    title: "여행지 " + (i + 1)
                });
                markers[i] = marker;

                var inputId = 'travelPoint' + (i + 1);
                var input = document.getElementById(inputId);
                input.value = '';
                input.placeholder = placeName;
                console.log(`여행지 ${i + 1} 설정됨: ${latLng.getLat()}, ${latLng.getLng()} (장소 이름: ${placeName})`);
                return;
            }
        }
        console.log('여행지 슬롯이 모두 찼습니다.');
    }

    // 여행지 삭제 함수
    function deleteTravelPoint(index) {
        if (travelPoints[index - 1]) {
            travelPoints[index - 1] = null;

            var inputId = 'travelPoint' + index;
            var input = document.getElementById(inputId);
            input.value = '';
            input.placeholder = '여행지를 입력해주세요';

            if (markers[index - 1]) {
                markers[index - 1].setMap(null);
                markers[index - 1] = null;
            }

            console.log(`여행지 ${index} 삭제됨`);
        } else {
            console.log(`여행지 ${index}가 설정되어 있지 않습니다.`);
        }
    }

    // 경로 그리기 함수
    function drawTravelRoute() {
        if (polyline) {
            polyline.setMap(null);
        }

        if (travelPoints.filter(Boolean).length < 2) {
            return;
        }

        var path = [];
        for (var i = 0; i < travelPoints.length; i++) {
            if (travelPoints[i]) {
                path.push(travelPoints[i].latLng);
            }
        }

        polyline = new kakao.maps.Polyline({
            map: map,
            path: path,
            strokeWeight: 5,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
        });

        polyline.setMap(map);

        var bounds = new kakao.maps.LatLngBounds();
        for (var i = 0; i < path.length; i++) {
            bounds.extend(path[i]);
        }

        map.setBounds(bounds);
    }

    // 장소 검색 함수
    function searchPlaces() {
        var keyword = document.getElementById('keyword').value;
        if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요');
            return false;
        }
        ps.keywordSearch(keyword, function (data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
                displayPlaces(data);
                displayPagination(pagination);
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                alert('검색 결과가 존재하지 않습니다.');
                return;
            } else if (status === kakao.maps.services.Status.ERROR) {
                alert('검색 결과 중 오류가 발생했습니다.');
                return;
            }
        });
    }

    // 장소 목록 표시 함수
    function displayPlaces(places) {
        var listEl = document.getElementById('placesList'),
            menuEl = document.getElementById('menu_wrap'),
            fragment = document.createDocumentFragment(),
            bounds = new kakao.maps.LatLngBounds();

        removeAllChildNods(listEl);
        removeMarker();

        for (var i = 0; i < places.length; i++) {
            var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
                marker = addMarker(placePosition, i, places[i].place_name),
                itemEl = getListItem(i, places[i]);

            bounds.extend(placePosition);
            fragment.appendChild(itemEl);

            (function (placePosition, placeName) {
                itemEl.onclick = function () {
                    console.log(`아이템 클릭됨: ${placePosition.getLat()}, ${placePosition.getLng()} (장소 이름: ${placeName})`);
                    map.setCenter(placePosition);
                    addTravelPoint(placePosition, placeName);
                };
            })(placePosition, places[i].place_name);
        }

        listEl.appendChild(fragment);
        menuEl.scrollTop = 0;
        map.setBounds(bounds);
    }

    // 마커 추가 함수
    function addMarker(position, idx, title) {
        var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
            imageSize = new kakao.maps.Size(36, 37),
            imgOptions = {
                spriteSize: new kakao.maps.Size(36, 691),
                spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10),
                offset: new kakao.maps.Point(13, 37)
            },
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
                position: position,
                image: markerImage
            });
        marker.setTitle(title);
        marker.setMap(map);
        markers.push(marker);
        return marker;
    }

    // 마커 제거 함수
    function removeMarker() {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]) {
                markers[i].setMap(null);
            }
        }
        markers = [];
    }

    // 페이지네이션 표시 함수
    function displayPagination(pagination) {
        var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
            i;
        while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild(paginationEl.lastChild);
        }
        for (i = 1; i <= pagination.last; i++) {
            var el = document.createElement('a');
            el.href = "#";
            el.innerHTML = i;
            if (i === pagination.current) {
                el.className = 'on';
            } else {
                el.onclick = (function (i) {
                    return function () {
                        pagination.gotoPage(i);
                    }
                })(i);
            }
            fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
    }

    // 리스트 아이템 생성 함수
    function getListItem(index, places) {
        var el = document.createElement('li'),
            itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
                '<div class="info">' +
                '   <h5>' + places.place_name + '</h5>';
        if (places.road_address_name) {
            itemStr += '    <span>' + places.road_address_name + '</span>' +
                '   <span class="jibun gray">' + places.address_name + '</span>';
        } else {
            itemStr += '    <span>' + places.address_name + '</span>';
        }
        itemStr += '  <span class="tel">' + places.phone + '</span>' +
            '</div>';
        el.innerHTML = itemStr;
        el.className = 'item';
        return el;
    }

    // 좌표로부터 주소 검색 함수
    function searchDetailAddrFromCoords(coords, callback) {
        geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    }

    // 노드의 모든 자식 노드 제거 함수
    function removeAllChildNods(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    }

    // 함수들을 전역으로 노출
    window.searchPlaces = searchPlaces;
    window.drawTravelRoute = drawTravelRoute;
    window.deleteTravelPoint = deleteTravelPoint;
    window.addTravelPoint = addTravelPoint;
}
