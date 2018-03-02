
(defun lookup-stack (tree index stack)
  (let* ((node  (car tree))
         (type  (cadr node))
         (span  (car node))
         (start (car span))
         (end   (cdr span)))
    (if (and (>= index start)
             (<= index end))
        (let ((children  (assq 'children node))
              (node-data (cons span type)))
          (if (null children)
              (cons node-data stack)
              (cons node-data stack)
            (lookup (cdr children) index (cons node-data stack))))
      (lookup (cdr tree) index stack))))


(defun lookup-in-stack (stack type)
  (member* type stack :test '(lambda (type e) (equal type (cdr e)))))


(defun lookup-function (cursor-pos)
  (let* ((stack          (lookup-stack index-tree cursor-pos '()))
         (function-stack (lookup-in-stack stack "function")))
    (print function-stack)
    (caar function-stack)))
