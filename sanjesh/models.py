from django.db import models


class session(models.Model):
    sess = models.IntegerField()
    dorost = models.BigIntegerField()
    best_of_dorost = models.IntegerField()
    def __str__(self):
        return f"جلسه {self.sess}"