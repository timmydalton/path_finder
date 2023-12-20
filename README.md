-- run: npm run start
-- port: 8081

Data parsed đã được chạy qua hàm để chuyển về dạng đồ thị
Đồ thị gồm array chứ các element, trong đó bao gồm các điểm (đỉnh) và đường (cạnh), biểu thị bởi kinh độ (lat) và vĩ độ (lng)
------------------------------------------------------------------------------------------
Cấu trúc 1 object đường
{
    "type": "Feature",
    "src": 167,
    "tgt": 168,
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                105.8215831,
                21.0256754
            ],
            [
                105.8218134,
                21.0254602
            ],
            [
                105.8218675,
                21.0254096
            ]
        ]
    },
    "properties": {
        "osmId": 194875325,
        "tags": {
            "highway": "residential"
        }
    },
    "id": 474
}

Hãy để ý, đường được nối giữa 2 đỉnh có id chứa trong src & tgt
Đường được biểu thị bởi các điểm nối nhau có tọa độ trong thuộc tính coordinates
Từ đó ta có thể tính được weight (chi phí đi = chiều dài) = độ dài đường đi theo tọa độ

Note: Để tính toán chính xác hơn thì nên nhân kinh độ, vĩ độ lên, vì hiện tại giá trị đang được làm tròn tới 7 dấu phẩy
------------------------------------------------------------------------------------------


Cấu trúc 1 object nút

{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [
            105.8195569,
            21.0132807
        ]
    },
    "properties": {
        "osmId": 1497526858,
        "tags": {}
    },
    "id": 103
}
------------------------------------------------------------------------------------------


Idea project là:
Click chọn 2 điểm trên bản đồ -> có lat & lng (tọa độ) 2 điểm đó, từ đó tìm 2 điểm gần với hai điểm click chuột nhất trong data rồi vẽ đường đi nối 2 điểm đó qua

Mục tiêu: Viết code thuật toán tìm đường đi ngắn nhất giữa 2 điểm trong data
Input: id hai điểm đầu cuối A và B
Output: Array chứa dãy các cạnh (LineString) cần phải đi qua lần lượt để di chuyển từ điểm A -> B, sao cho tổng chi phí di chuyển là ngắn nhất

Note: Vì data này không phải đồ thị "kín", nghĩa là tồn tại nhiều graph trong data và các graph không được liên kết với nhau, nên hãy add fallback cho trường hợp không tìm thấy đường đi giữa 2 điểm

Note: Để giảm hiệu năng tính toán tìm đường đi, thì data nên được tính toán trước, các đường đi LineString chúng ta sẽ tính toán
  trước weight rồi lưu lại, khi chạy thuật toán tìm đường chỉ cần lấy data weight ra để so sánh, không cần tính lại -> Làm sau