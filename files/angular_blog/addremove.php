<?php

include 'config.php';

$data = json_decode(file_get_contents("php://input"));

$request_type = $data->request_type;

if($request_type == 1){
  $stmt = $con->prepare("SELECT * FROM posts");
  $stmt->execute();
  $result = $stmt->get_result();
  $data = array();
  if($result->num_rows > 0){
     while($row = $result->fetch_assoc()) {
            $data[] = array("id"=>$row['id'],"title"=>$row['title'],"content"=>$row['content']);
     }
  }

  $stmt->close();
  echo json_encode($data);
  exit;
}

if($request_type == 2){
  $title = $data->title;
  $content = $data->content;

  $stmt = $con->prepare("SELECT * FROM posts WHERE title=?");
  $stmt->bind_param('s',$title);
  $stmt->execute();
  $result = $stmt->get_result();
  $stmt->close();
  $return_arr = array();
  if($result->num_rows == 0){

    $insertSQL = "INSERT INTO posts(title,content ) values(?,?)";
    $stmt = $con->prepare($insertSQL);
    $stmt->bind_param("ss",$title,$content);
    $stmt->execute();

    $lastinsert_id = $stmt->insert_id;
    if($lastinsert_id > 0){
       $return_arr[] = array("id"=>$lastinsert_id,"title"=>$title,"content"=>$content);
    }
    $stmt->close();
  }
  echo json_encode($return_arr);
  exit;
}

if($request_type == 3){
  $id = $data->id;

  $stmt = $con->prepare("SELECT * FROM posts WHERE id=?");
  $stmt->bind_param('i',$id);
  $stmt->execute();
  $result = $stmt->get_result();
  $stmt->close();

  if($result->num_rows > 0){

    $deleteSQL = "DELETE FROM posts WHERE id=?";
    $stmt = $con->prepare($deleteSQL);
    $stmt->bind_param("i",$id);
    $stmt->execute();
    $stmt->close();

    echo 1;
  }else{
    echo 0;
  }

  exit;
}

?>
