---
layout: null
permalink: /
---

<!DOCTYPE html>
<html>
<head>
    <script>
        var userLang = (navigator.language || navigator.userLanguage).substring(0, 2);
        var supportedLangs = ['ko', 'en', 'de', 'es', 'fr', 'ja', 'zh'];
        
        // 사용자의 언어가 지원 목록에 있으면 그 폴더로, 없으면 영어(/en/)로 리다이렉트
        if (supportedLangs.indexOf(userLang) > -1) {
            window.location.href = './' + userLang + '/';
        } else {
            window.location.href = './en/';
        }
    </script>
</head>
<body>
</body>
</html>
