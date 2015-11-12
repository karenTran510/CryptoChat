<html> 
 <head> 
	<title> Login-Cryptochat </title>
	<link rel="stylesheet" href="C:\Users\Karen\Documents\CECS478\login.css">
 </head> 
 <h1>Cryptochat Login</h1>
 <body> 
 <div class= "container">
	<form action="login_Page.php">
		<label>Username <br><input type = "text" name="username"/>  </label>
		<label>Password <br><input type ="password" name="password"/> </label>
		<br> 
	<div class = "button" >
		<label><input type="button" onclick="check(this.form)" value="Login"/> </label>
		<br>
		<label> <a href = "http://www.google.com"> Create an Account </a></label>
	</div>
	</form>
 </div>
 
 <?php
	require("config.php"); 
	$submitted_username = ''; 
	//If the input fields are not empty, then store query in a string
    if(!empty($_POST)){ 
        $query = " 
            SELECT 
                username, 
                password, 
                salt 
            FROM user 
            WHERE 
                username = :username 
        "; 
		$query_params = array( 
            ':username' => $_POST['username'] 
        ); 
          
        try{ 
            $stmt = $db->prepare($query); 
            $result = $stmt->execute($query_params); 
        } 
        catch(PDOException $ex){ die("Failed to run query: " . $ex->getMessage()); } 
        $login_ok = false; 
        $row = $stmt->fetch(); 
        if($row){ 
            $check_password = hash('sha256', $_POST['password'] . $row['salt']); 
            for($round = 0; $round < 65536; $round++){
                $check_password = hash('sha256', $check_password . $row['salt']);
            } 
            if($check_password === $row['password']){
                $login_ok = true;
            } 
        } 
	
		//Redirects to the chatroom if user's credentials are correct
        if($login_ok){ 
            unset($row['salt']); 
            unset($row['password']); 
            $_SESSION['user'] = $row;  
            header("Location: index.html"); 
            die("Redirecting to: index.html"); 
        } 
		//Print out Login failed 
        else{ 
            print("Login Failed"); 
            $submitted_username = htmlentities($_POST['username'], ENT_QUOTES, 'UTF-8'); 
        } 
    }   
 ?>

 </body>
</html>
		