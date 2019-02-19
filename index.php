<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Test</title>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">
    <link rel="stylesheet" href="css/libs/bootstrap-4.1.3-dist/bootstrap.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="js/libs/html2canvas.min.js"></script>
    <script src="js/thanos.js"></script>
</head>

<body>
    <div id="page-header">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-5 header-logo">
                    <img class="img-fluid" src="assets/img/random-logo.png"></div>
            </div>
        </div>
    </div>
    <div id="hero-section"></div>
    <div id="main-content">
        <div class="container">
            <div class="row">
                <?php for($i = 0; $i < 10; $i++): ?>
                <div class="col-12 col-md-6 col-lg-4 mb-5">
                    <div class="content-box box-type-<?php echo $i + 1; ?>">
                        <img class="img-fluid box-image" src="assets/img/image-<?php echo rand(2,2); ?>.jpg">
                        <h4 class="box-title">Lorem ipsum dolor sit amet</h4>
                        <p class="box-text">In fringilla, odio vitae aliquet scelerisque, quam tellus vehicula mauris, ac maximus sem elit luctus lorem. Duis bibendum arcu eget mi laoreet volutpat.</p>
                    </div>
                </div>
                <?php endfor; ?>
            </div>
        </div>
    </div>
    <div id="page-footer"></div>


</body>

</html>
